export default class DatabaseService {
  static async bulkUpsert(Model, docs, uniqueField) {
    if (!docs.length) return []

    const ops = docs.map(doc => ({
      updateOne: {
        filter: { [uniqueField]: doc[uniqueField] },
        update: { $set: { ...doc, syncedAt: new Date() } },
        upsert: true
      }
    }))

    await Model.bulkWrite(ops)
    return docs
  }
}
