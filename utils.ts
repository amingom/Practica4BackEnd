import { Collection } from "mongodb";
import { PartsModel } from "./types.ts";
import { Vehicles, VehiclesModel } from "./types.ts";
import { Parts } from "./types.ts";
import { getJoke } from "./resolvers.ts";

export const fromModelToVehicle = async (
    vehicleDB: VehiclesModel,
    partsCollection: Collection<PartsModel>
  ): Promise<Vehicles> => {
    const parts = await partsCollection
      .find({ _id: { $in: vehicleDB.parts } })
      .toArray();
    const joke = await getJoke();
    return {
        id: vehicleDB._id!.toString(), 
        name: vehicleDB.name,
        manufacturer: vehicleDB.manufacturer,
        year: vehicleDB.year,
        joke,
        parts: parts.map((p) => fromModelToParts(p)),
    };
  };

export const fromModelToParts = (parts: PartsModel): Parts => ({
    id: parts._id!.toString(),
    name: parts.name,
    price: parts.price,
    vehicleId: parts.vehicleId.toString(),
  });