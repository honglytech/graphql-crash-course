const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const app = express();
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
} = require("graphql");

const owners = [
  { id: 1, name: "John" },
  { id: 2, name: "Kelly" },
  { id: 3, name: "Jack" },
];

const pets = [
  { id: 1, name: "Charlie", ownerId: 1 },
  { id: 2, name: "Max", ownerId: 1 },
  { id: 3, name: "Charlie", ownerId: 1 },
  { id: 4, name: "Oscar", ownerId: 2 },
  { id: 5, name: "Milo", ownerId: 2 },
  { id: 6, name: "Teddy", ownerId: 3 },
  { id: 7, name: "Coco", ownerId: 3 },
  { id: 8, name: "Lucy", ownerId: 3 },
  { id: 9, name: "Ruby", ownerId: 3 },
  { id: 10, name: "Lola", ownerId: 1 },
];

// const schema = new GraphQLSchema({
//   query: new GraphQLObjectType({
//     name: "RootQueryType",
//     fields: () => ({
//       message: { type: GraphQLString, resolve: () => "Hello World" },
//       hi: { type: GraphQLString, resolve: () => "Hi there!" },
//     }),
//   }),
// });

const PetType = new GraphQLObjectType({
  name: "Pet",
  description: "This represents a pet owned by an owner",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    ownerId: { type: GraphQLNonNull(GraphQLInt) },
    owner: {
      type: OwnerType,
      resolve: (pet) => {
        return owners.find((owner) => owner.id === pet.ownerId);
      },
    },
  }),
});

const OwnerType = new GraphQLObjectType({
  name: "Owner",
  description: "This represents an owner of a pet",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    pets: {
      type: new GraphQLList(PetType),
      resolve: (owner) => {
        return pets.filter((pet) => pet.ownerId === owner.id);
      },
    },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    pet: {
      type: PetType,
      description: "A single pet",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) => pets.find((pet) => pet.id === args.id),
    },
    pets: {
      type: new GraphQLList(PetType),
      description: "A list of all pets",
      resolve: () => pets,
    },
    owner: {
      type: OwnerType,
      description: "A single owner",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) => owners.find((owner) => owner.id === args.id),
    },
    owners: {
      type: new GraphQLList(OwnerType),
      description: "A list of all owners",
      resolve: () => owners,
    },
  }),
});

const RootMutationType = new GraphQLObjectType({
  name: "Mutation",
  description: "Root Mutation",
  fields: () => ({
    addNewPet: {
      type: PetType,
      description: "Add a new pet",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        ownerId: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, args) => {
        const pet = {
          id: pets.length + 1,
          name: args.name,
          ownerId: args.ownerId,
        };
        pets.push(pet);
        return pet;
      },
    },
    addNewOwner: {
      type: OwnerType,
      description: "Add a new owner",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        const owner = {
          id: owners.length + 1,
          name: args.name,
        };
        owners.push(owner);
        return owner;
      },
    },
  }),
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

app.listen(5000, () => console.log(`Server running on port 5000`));
