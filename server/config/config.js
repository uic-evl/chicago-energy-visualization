var env = process.env.NODE_ENV || 'development';
console.log('env ******', env);

if (env === 'development'){
	process.env.PORT = 3000;
	process.env.MONGODB_URI = 'mongodb://localhost:27017/chicago_energy_2010';
} else if (env === 'test'){
	process.env.PORT = 3000;
	process.env.MONGODB_URI = 'mongodb://localhost:27017/chicago_energy_2010_test';
}