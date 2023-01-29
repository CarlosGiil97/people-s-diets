const mongoose = require("mongoose");


const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Por favor ingrese email!"],
        unique: [true, "El email ya existe"],
      },
    
      password: {
        type: String,
        required: [true, "Por favor ingresa una contraseña!"],
        unique: false,
      },
  })

module.exports = mongoose.model.Users || mongoose.model("Users", UserSchema);