const e = module.exports

const address = {
  type: "string",
  // pattern: "/^0x[a-fA-F0-9]{40}$/"
}

e.listMonsters = {
  query: {
    type: "object",
    required: ["address", "limit"],
    properties: {
      address,
      limit: {
        type: "number"
      }
    },
    additionalProperties: {
      next: {
        type: "object",
        required: ["monsterId"]
      }
    }
  }
}

e.getMonster = {
  query: {
    type: "object",
    required: ["monsterId"],
    properties: {
      monsterId: {
        type: "number"
      }
    },
    additionalProperties: false
  }
}

e.listClashes = {
  query: {
    type: "object",
    required: ["address", "limit"],
    properties: {
      address,
      next: {
        type: "object",
        required: ["clashId", "address"],
        properties: {
          clashId: { type: "string" },
          address
        }
      },
      limit: {
        type: "number"
      }
    },
    additionalProperties: {
      next: {
        type: "object",
        required: ["clashId", "address"],
        properties: {
          clashId: { type: "string" },
          address
        }
      }
    }
  }
}

e.getBattle = {
  query: {
    type: "object",
    required: ["clashId", "address"],
    properties: {
      clashId: {
        type: "string"
      },
      address
    },
    additionalProperties: false
  }
}
