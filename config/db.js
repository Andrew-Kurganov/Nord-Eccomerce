async function connectDB() {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing");
    }
  
    if (cached.conn) return cached.conn;
  
    if (!cached.promise) {
      const opts = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
      };
  
      // Явное указание базы данных в URI
      cached.promise = mongoose.connect(process.env.MONGODB_URI, opts)
        .then(conn => {
          console.log("Connected to MongoDB:", conn.connection.db.databaseName);
          return conn;
        })
        .catch(err => {
          console.error("MongoDB connection error:", err);
          throw err;
        });
    }
  
    cached.conn = await cached.promise;
    return cached.conn;
  }