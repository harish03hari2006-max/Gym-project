// server/db/localStore.js
// Embedded JSON file-backed database store that mirrors MongoDB/Mongoose API
// Activates seamlessly when a local MongoDB server is not active.

const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function genId() {
  return crypto.randomBytes(12).toString('hex');
}

class Query {
  constructor(items, collection) {
    this._items         = items;
    this._col           = collection;
    this._sortObj       = null;
    this._selectStr     = null;
    this._populateField = null;
  }

  sort(sortObj = {}) {
    this._sortObj = sortObj;
    return this;
  }

  select(fieldsStr = '') {
    this._selectStr = fieldsStr;
    return this;
  }

  populate(field) {
    this._populateField = field;
    return this;
  }

  async _execute() {
    let list = this._items.map(i => this._col._wrapDoc(i));

    if (this._sortObj) {
      list.sort((a, b) => {
        for (const [k, dir] of Object.entries(this._sortObj)) {
          if (a[k] < b[k]) return dir === -1 ? 1 : -1;
          if (a[k] > b[k]) return dir === -1 ? -1 : 1;
        }
        return 0;
      });
    }

    if (this._selectStr) {
      list = this._col._applySelect(list, this._selectStr);
    }

    if (this._populateField) {
      list = await this._col._populateList(list, this._populateField);
    }

    return list;
  }

  then(resolve, reject) {
    return this._execute().then(resolve, reject);
  }

  catch(reject) {
    return this._execute().catch(reject);
  }
}

class SingleDocQuery {
  constructor(item, collection) {
    this._item          = item;
    this._col           = collection;
    this._selectStr     = null;
    this._populateField = null;
  }

  select(fieldsStr = '') {
    this._selectStr = fieldsStr;
    return this;
  }

  populate(field) {
    this._populateField = field;
    return this;
  }

  async _execute() {
    if (!this._item) return null;
    let doc = this._col._wrapDoc(this._item);

    if (this._selectStr) {
      doc = this._col._applySelect([doc], this._selectStr)[0];
    }

    if (this._populateField) {
      doc = await this._col._populateSingle(doc, this._populateField);
    }

    return doc;
  }

  then(resolve, reject) {
    return this._execute().then(resolve, reject);
  }

  catch(reject) {
    return this._execute().catch(reject);
  }
}

class Collection {
  constructor(name) {
    this.name = name;
    this.file = path.join(DATA_DIR, `${name}.json`);
  }

  _read() {
    try {
      if (!fs.existsSync(this.file)) return [];
      const content = fs.readFileSync(this.file, 'utf8');
      return content ? JSON.parse(content) : [];
    } catch {
      return [];
    }
  }

  _write(data) {
    fs.writeFileSync(this.file, JSON.stringify(data, null, 2), 'utf8');
  }

  find(filter = {}) {
    let items = this._read();
    if (filter && Object.keys(filter).length > 0) {
      items = items.filter(item => {
        for (const [key, val] of Object.entries(filter)) {
          if (item[key] !== val) return false;
        }
        return true;
      });
    }
    return new Query(items, this);
  }

  findOne(filter = {}) {
    const items = this._read();
    const found = items.find(item => {
      for (const [key, val] of Object.entries(filter)) {
        if (key === 'email' && item.email && val) {
          if (item.email.toLowerCase() !== val.toLowerCase()) return false;
        } else if (item[key] !== val) {
          return false;
        }
      }
      return true;
    });

    return new SingleDocQuery(found || null, this);
  }

  findById(id) {
    if (!id) return new SingleDocQuery(null, this);
    const strId = id.toString();
    const items = this._read();
    const found = items.find(i => i._id === strId);
    return new SingleDocQuery(found || null, this);
  }

  async create(docData) {
    const items = this._read();
    const now   = new Date().toISOString();
    const item  = {
      _id:       genId(),
      ...docData,
      createdAt: now,
      updatedAt: now
    };

    if (this.name === 'users' && item.password) {
      if (!item.password.startsWith('$2')) {
        item.password = await bcrypt.hash(item.password, 10);
      }
      item.cart = item.cart || [];
    }

    items.push(item);
    this._write(items);
    return this._wrapDoc(item);
  }

  async insertMany(docs) {
    const items = this._read();
    const now   = new Date().toISOString();
    const created = docs.map(d => ({
      _id: genId(),
      ...d,
      createdAt: now,
      updatedAt: now
    }));
    items.push(...created);
    this._write(items);
    return created.map(c => this._wrapDoc(c));
  }

  async findByIdAndUpdate(id, updateData, opts = {}) {
    const strId = id.toString();
    const items = this._read();
    const idx   = items.findIndex(i => i._id === strId);
    if (idx === -1) return null;

    items[idx] = {
      ...items[idx],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    this._write(items);
    return this._wrapDoc(items[idx]);
  }

  async findByIdAndDelete(id) {
    const strId = id.toString();
    const items = this._read();
    const idx   = items.findIndex(i => i._id === strId);
    if (idx === -1) return null;

    const deleted = items.splice(idx, 1)[0];
    this._write(items);
    return this._wrapDoc(deleted);
  }

  async countDocuments(filter = {}) {
    const items = this._read();
    if (!filter || Object.keys(filter).length === 0) return items.length;
    return items.filter(item => {
      for (const [k, v] of Object.entries(filter)) {
        if (item[k] !== v) return false;
      }
      return true;
    }).length;
  }

  async aggregate(pipeline = []) {
    const items = this._read();
    let res = [...items];
    for (const stage of pipeline) {
      if (stage.$match) {
        res = res.filter(item => {
          for (const [k, cond] of Object.entries(stage.$match)) {
            if (cond && typeof cond === 'object' && cond.$ne !== undefined) {
              if (item[k] === cond.$ne) return false;
            } else if (item[k] !== cond) {
              return false;
            }
          }
          return true;
        });
      }
      if (stage.$group) {
        const sumField = stage.$group.total?.$sum?.replace('$', '');
        const total = res.reduce((acc, curr) => acc + (Number(curr[sumField]) || 0), 0);
        return [{ _id: null, total }];
      }
    }
    return res;
  }

  _wrapDoc(raw) {
    const self = this;
    const doc  = { ...raw };

    if (this.name === 'users') {
      doc.comparePassword = function(plain) {
        return bcrypt.compare(plain, this.password);
      };
      doc.save = async function() {
        const all = self._read();
        const idx = all.findIndex(u => u._id === this._id);
        if (idx > -1) {
          all[idx] = { ...this, updatedAt: new Date().toISOString() };
          self._write(all);
        }
        return this;
      };
    }
    return doc;
  }

  _applySelect(list, fieldsStr) {
    if (!fieldsStr) return list;
    const excludes = fieldsStr.split(' ').filter(f => f.startsWith('-')).map(f => f.slice(1));
    return list.map(item => {
      const copy = { ...item };
      for (const ex of excludes) delete copy[ex];
      return copy;
    });
  }

  async _populateSingle(userOrOrder, field) {
    if (field === 'cart.product') {
      const pCol = new Collection('products');
      const allProducts = pCol._read();
      if (userOrOrder.cart && Array.isArray(userOrOrder.cart)) {
        userOrOrder.cart = userOrOrder.cart.map(c => {
          const prodId = typeof c.product === 'object' ? c.product?._id : c.product;
          const found = allProducts.find(p => p._id === prodId?.toString());
          return { ...c, product: found || c.product };
        });
      }
    } else if (field === 'user') {
      const uCol = new Collection('users');
      const allUsers = uCol._read();
      const uId = typeof userOrOrder.user === 'object' ? userOrOrder.user?._id : userOrOrder.user;
      const found = allUsers.find(u => u._id === uId?.toString());
      if (found) {
        const { password, ...safeUser } = found;
        userOrOrder.user = safeUser;
      }
    }
    return userOrOrder;
  }

  async _populateList(items, field, selectFields) {
    const populated = await Promise.all(items.map(i => this._populateSingle(i, field)));
    return populated;
  }
}

module.exports = {
  User:        new Collection('users'),
  Product:     new Collection('products'),
  WorkoutPlan: new Collection('workoutplans'),
  Order:       new Collection('orders'),
  Contact:     new Collection('contacts'),
  Testimonial: new Collection('testimonials')
};
