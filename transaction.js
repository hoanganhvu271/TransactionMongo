const { MongoClient } = require('mongodb');

async function main() {
    const uri = "mongodb+srv://<username>:<password>@cluster0.mongodb.net/test";
    const client = new MongoClient(uri);

    try {
        await client.connect();

        const session = client.startSession();

        const studentsCollection = client.db('test').collection('student');

        session.startTransaction();

        const student1 = { name: 'Alice', age: 20 };
        const student2 = { name: 'Bob', age: 22 };

        await studentsCollection.insertOne(student1, { session });
        await studentsCollection.insertOne(student2, { session });

        await session.commitTransaction();
    } catch (error) {
        console.error('Error processing transaction', error);
        session.abortTransaction();
    } finally {
        session.endSession();
        await client.close();
    }
}

main().catch(console.error);