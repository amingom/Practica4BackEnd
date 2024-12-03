import { Collection, ObjectId } from "mongodb";
import { Vehicles, VehiclesModel, PartsModel, Parts } from "./types.ts";
import { fromModelToParts, fromModelToVehicle } from "./utils.ts";

export async function getJoke(): Promise<string> {
    const response = await fetch("https://official-joke-api.appspot.com/jokes/random");
    const data = await response.json();
  
    if (data && data.setup && data.punchline) {
      return `${data.setup} - ${data.punchline}`; 
    }
  
    return "No joke available";
  }
  
export const resolvers = {
  Query: {
    vehicle: async (
      _: unknown,
      { id }: { id: string },
      context: {
        vehiclesCollection: Collection<VehiclesModel>;
        partsCollection: Collection<PartsModel>;
      }
    ): Promise<Vehicles | null> => {
      const vehiculoModel = await context.vehiclesCollection.findOne({
        _id: new ObjectId(id),
      });
      if (!vehiculoModel) {
        return null;
      }
      return fromModelToVehicle(vehiculoModel, context.partsCollection);
    },

    vehicles: async (
      _: unknown,
      __: unknown,
      context: {
        vehiclesCollection: Collection<VehiclesModel>;
        partsCollection: Collection<PartsModel>;
      }
    ): Promise<Vehicles[]> => {
      const vehicles = await context.vehiclesCollection.find().toArray();
      return Promise.all(
        vehicles.map((vehiculo) =>
          fromModelToVehicle(vehiculo, context.partsCollection)
        )
      );
    },

    parts: async (
        _: unknown,
        __: unknown,
        context: {
          partsCollection: Collection<PartsModel>;
        }
      ): Promise<Parts[]> => {
        const parts = await context.partsCollection.find().toArray();
        return parts.map(fromModelToParts);
      },

    vehiclesByManufacturer: async (
        _: unknown,
        { manufacturer }: { manufacturer: string },
        context: {
          vehiclesCollection: Collection<VehiclesModel>;
          partsCollection: Collection<PartsModel>;
        }
      ): Promise<Vehicles[]> => {
        const vehiculos = await context.vehiclesCollection
          .find({ manufacturer })
          .toArray();
        return Promise.all(
          vehiculos.map((vehiculo) =>
            fromModelToVehicle(vehiculo, context.partsCollection)
          )
        );
      },

      partsByVehicle: async (
        _: unknown,
        { vehicleId }: { vehicleId: string },
        context: {
          partsCollection: Collection<PartsModel>;
        }
      ): Promise<Parts[]> => {
        const parts = await context.partsCollection
          .find({ vehicleId: new ObjectId(vehicleId) })
          .toArray();
        return parts.map(fromModelToParts);
      },

      vehiclesByYearRange: async (
        _: unknown,
        { startYear, endYear }: { startYear: number; endYear: number },
        context: {
          vehiclesCollection: Collection<VehiclesModel>;
          partsCollection: Collection<PartsModel>;
        }
      ): Promise<Vehicles[]> => {
        const vehiculos = await context.vehiclesCollection
          .find({
            year: {
              $gte: startYear,
              $lte: endYear,
            },
          })
          .toArray();
        return Promise.all(
          vehiculos.map((vehiculo) =>
            fromModelToVehicle(vehiculo, context.partsCollection)
          )
        );
      },
    },

  Mutation: {
    
    addVehicle: async (
        _: unknown,
        { name, manufacturer, year }: { name: string; manufacturer: string; year: number },
        context: {
          vehiclesCollection: Collection<VehiclesModel>;
        }
      ): Promise<Vehicles> => {
        const joke = await getJoke();
  
        const result = await context.vehiclesCollection.insertOne({
          name,
          manufacturer,
          year,
          parts: [],
        });
  
        return {
          id: result.insertedId.toString(),
          name,
          manufacturer,
          year,
          joke,
          parts: [],
        };
    },

    addPart: async (
      _: unknown,
      { name, price, vehicleId }: { name: string; price: number; vehicleId: string },
      context: {
        partsCollection: Collection<PartsModel>;
        vehiclesCollection: Collection<VehiclesModel>;
      }
    ): Promise<Parts> => {
      const part = {
        name,
        price,
        vehicleId: new ObjectId(vehicleId),
      };
      const result = await context.partsCollection.insertOne(part);

      await context.vehiclesCollection.updateOne(
        { _id: new ObjectId(vehicleId) },
        { $push: { parts: result.insertedId } }
      );

      return {
        id: result.insertedId.toString(),
        name,
        price,
        vehicleId,
      };
    },

    updateVehicle: async (
      _: unknown,
      { id, name, manufacturer, year }: { id: string; name?: string; manufacturer?: string; year?: number },
      context: {
        vehiclesCollection: Collection<VehiclesModel>;
      }
    ): Promise<Vehicles | null> => {
      const updates: Partial<VehiclesModel> = { name, manufacturer, year };
    
      await context.vehiclesCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updates }
      );
  
      const updatedVehicle = await context.vehiclesCollection.findOne({ _id: new ObjectId(id) });
      const joke = await getJoke()
    
      if (!updatedVehicle) return null;
    
      return {
        id: updatedVehicle._id.toString(),
        name: updatedVehicle.name,
        manufacturer: updatedVehicle.manufacturer,
        year: updatedVehicle.year,
        joke,
        parts: [],
      };
    },

    deletePart: async (
      _: unknown,
      { id }: { id: string },
      context: {
        partsCollection: Collection<PartsModel>;
        vehiclesCollection: Collection<VehiclesModel>;
      }
    ): Promise<Parts> => {
      const partToDelete = await context.partsCollection.findOne({
        _id: new ObjectId(id),
      });
    
      if (!partToDelete) {
        throw new Error("Part not found");
      }
    
      await context.partsCollection.deleteOne({ _id: new ObjectId(id) });
    
      await context.vehiclesCollection.updateMany(
        { parts: new ObjectId(id) },
        { $pull: { parts: new ObjectId(id) } }
      );
    
      return {
        id: partToDelete._id.toString(),
        name: partToDelete.name,
        price: partToDelete.price,
        vehicleId: partToDelete.vehicleId.toString(),
      };
    },
  },
};