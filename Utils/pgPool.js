const { Pool } = require('pg');
require('dotenv').config();

module.exports = new Pool();
