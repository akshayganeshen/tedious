import iconv from 'iconv-lite';
import { DataType } from '../data-type';

const NULL_LENGTH = Buffer.from([0xFF, 0xFF]);

const Char: { maximumLength: number } & DataType = {
  id: 0xAF,
  type: 'BIGCHAR',
  name: 'Char',
  maximumLength: 8000,

  declaration: function(parameter) {
    const value = parameter.value as Buffer | null;

    let length;
    if (parameter.length) {
      length = parameter.length;
    } else if (value != null) {
      length = value.length || 1;
    } else if (value === null && !parameter.output) {
      length = 1;
    } else {
      length = this.maximumLength;
    }

    if (length < this.maximumLength) {
      return 'char(' + length + ')';
    } else {
      return 'char(' + this.maximumLength + ')';
    }
  },

  // ParameterData<any> is temporary solution. TODO: need to understand what type ParameterData<...> can be.
  resolveLength: function(parameter) {
    const value = parameter.value as Buffer | null;

    if (parameter.length != null) {
      return parameter.length;
    } else if (value != null) {
      return value.length || 1;
    } else {
      return this.maximumLength;
    }
  },

  generateTypeInfo(parameter) {
    const buffer = Buffer.alloc(8);
    buffer.writeUInt8(this.id, 0);
    buffer.writeUInt16LE(parameter.length!, 1);

    if (parameter.collation) {
      parameter.collation.toBuffer().copy(buffer, 3, 0, 5);
    }

    return buffer;
  },

  generateParameterLength(parameter, options) {
    const value = parameter.value as Buffer | null;

    if (value == null) {
      return NULL_LENGTH;
    }

    const buffer = Buffer.alloc(2);
    buffer.writeUInt16LE(value.length, 0);
    return buffer;
  },

  * generateParameterData(parameter, options) {
    if (parameter.value == null) {
      return;
    }

    yield Buffer.from(parameter.value, 'ascii');
  },

  validate: function(value, collation): Buffer | null {
    if (value == null) {
      return null;
    }

    if (typeof value !== 'string') {
      if (typeof value.toString !== 'function') {
        throw new TypeError('Invalid string.');
      }
      value = value.toString();
    }

    if (!collation) {
      throw new Error('No collation was set by the server for the current connection.');
    }

    if (!collation.codepage) {
      throw new Error('The collation set by the server has no associated encoding.');
    }

    return iconv.encode(value, collation.codepage);
  }
};

export default Char;
module.exports = Char;
