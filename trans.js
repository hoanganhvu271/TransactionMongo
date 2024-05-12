const { MongoClient } = require('mongodb')

async function main() {
    const uri = 'mongodb://localhost:28081'
    client = await MongoClient.connect(uri)

    const db = await client.db('hello')
    //show db
    // const show = await db.stats()

    const session = client.startSession()
    session.startTransaction()

    try {
        const opts = { session, returnOriginal: true }
        const opts2 = { session, returnDocument: 'after' }

        //query1
        const sv = await db.collection('sinhvien').findOne({ name: 'vu' }, opts)
        console.log(sv.name)
        //query2
        const user = await db.collection('sinhvien').findOneAndUpdate({ name: 'vu2' }, { $set: { name: 'vu' } }, opts2);
        console.log(user.name);

        await session.commitTransaction()
        session.endSession()
    }
    catch (e) {
        console.log(e)
        await session.abortTransaction()
        session.endSession()
    }
}
main()