import { ApolloServer } from "@apollo/server";
import { schema } from "./schema.ts";
import { MongoClient } from "mongodb";
import { VehiclesModel,PartsModel} from "./types.ts";
import { startStandaloneServer } from "@apollo/server/standalone";
import { resolvers } from "./resolvers.ts";

const MONGO_URL = "mongodb+srv://db_username:db_password@backend.pgd3j.mongodb.net/?retryWrites=true&w=majority&appName=BackEnd";

const mongoClient = new MongoClient(MONGO_URL);
await mongoClient.connect();

console.info("Connected to MongoDB");

const mongoDB = mongoClient.db("Practica4");
const vehiclesCollection = mongoDB.collection<VehiclesModel>("vehiculos");
const partsCollection = mongoDB.collection<PartsModel>("parts");

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  context: async () => ({ vehiclesCollection, partsCollection }),
});

console.info(`Server ready at ${url}`);