const dbConfig = require("../utils/dbConfig");
var fs        = require('fs');
var path      = require('path');
var basename  = path.basename(module.filename);

var dbs = {};

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    define: {
        timestamps: false
    },
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
});

// Check the database connection
sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });

fs.readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(function(file) {
        const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes)
        dbs[model.name] = model;
    });

Object.keys(dbs).forEach(function(modelName) {
    if (dbs[modelName].associate) {
        dbs[modelName].associate(dbs);
    }
});

sequelize.sync({ force: false }).then(() => {
    console.log('Database synced successfully');
}).catch(err => {
    console.error('Error syncing database:', err);
});

dbs.sequelize = sequelize;
dbs.Sequelize = Sequelize;

module.exports = dbs;