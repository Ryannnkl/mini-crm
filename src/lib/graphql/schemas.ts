export const typeDefs = `#graphql
  type Company {
    id: Int!
    name: String!
    status: CompanyStatus!
    website: String
    phone: String
    primaryContactName: String
    primaryContactEmail: String
    potentialValue: Int!
    leadSource: LeadSource!
    userId: String!
  }

  enum CompanyStatus {
    lead
    negotiating
    won
    lost
  }

  enum LeadSource {
    website
    referral
    cold_call
    other
  }

  type Interaction {
    id: Int!
    content: String!
    createdAt: String!
    companyId: Int!
  }

  type Query {
    companies: [Company!]!
    company(id: Int!): Company
    interactions(companyId: Int!): [Interaction!]!
  }

  type Mutation {
    createCompany(input: CreateCompanyInput!): Company!
    updateCompany(id: Int!, input: UpdateCompanyInput!): Company!
    deleteCompany(id: Int!): Boolean!
    createInteraction(companyId: Int!, content: String!): Interaction!
  }

  input CreateCompanyInput {
    name: String!
    status: CompanyStatus
    website: String
    phone: String
    primaryContactName: String
    primaryContactEmail: String
    potentialValue: Int
    leadSource: LeadSource
  }

  input UpdateCompanyInput {
    name: String
    status: CompanyStatus
    website: String
    phone: String
    primaryContactName: String
    primaryContactEmail: String
    potentialValue: Int
    leadSource: LeadSource
  }
`;
