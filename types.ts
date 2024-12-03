import { ObjectId, OptionalId } from "mongodb";

export type VehiclesModel = OptionalId<{
  name: string;
  manufacturer: string;
  year: number;
  parts: ObjectId[];
}>;

export type PartsModel = OptionalId<{
    name: string;
    price: number;
    vehicleId: ObjectId;
}>;

export type Vehicles = {
  id: string;
  name: string;
  manufacturer: string;
  year: number;
  joke: string;
  parts: Parts[];
};

export type Parts = {
    id: string;
    name: string;
    price: number;
    vehicleId: string;
}




