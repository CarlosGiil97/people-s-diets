const jwt = require("jsonwebtoken");


module.exports = async (request, response, next) => {
  try {
    //obtener el token de la cabecera de autorización
    const token = await request.headers.authorization.split(" ")[1];

    //comprobar si el token coinciden
    const decodedToken = await jwt.verify(token, "RANDOM-TOKEN");

    // obtener los datos del usuario logeado
    const user = await decodedToken;

    // pasar el usuario a la request
    request.user = user;

    
    next();
    
  } catch (error) {
    response.status(401).json({
      error: new Error("Invalid request!"),
    });
  }
};
