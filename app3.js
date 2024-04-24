

const { MongoClient } = require('mongodb');

async function main() {

    const uri = 'mongodb://localhost:27018';
    client = await MongoClient.connect(uri);

    const db = client.db("demo");

    try {
        await transfer('A', 'B', 50000);
    } catch (error) {
        console.log('\nGiao dịch không thành công\n')
    }

    async function transfer(from, to, amount) {
        const session = client.startSession();
        session.startTransaction();

        try {

            // 1. 
            const opts = { session, returnOriginal: true };
            const filterFrom = { name: from };
            const resultFrom = await db.collection('tmp').findOne(filterFrom);
            if (!resultFrom) {
                throw new Error(`Không tìm thấy tài khoản có tên ${from}`);
            }

            //2. 
            const A = resultFrom;
            const newBalanceA = A.balance - amount;
            if (newBalanceA < 0) {
                throw new Error(`Không đủ tiền trong tài khoản ${from}`);
            }

            // 3. 
            await db.collection('tmp').updateMany(filterFrom, { $set: { balance: newBalanceA } }, opts);


            // 4.
            const filterTo = { name: to };
            const resultTo = await db.collection('tmp').findOne(filterTo);
            if (!resultTo) {
                throw new Error(`Không tìm thấy tài khoản có tên ${to}`);
            }

            // 5. 
            const B = resultTo;
            const newBalanceB = B.balance + amount;
            await db.collection('tmp').updateMany(filterTo, { $set: { balance: newBalanceB } }, opts);

            // Commit Transaction
            await session.commitTransaction();
            session.endSession();
            return { from: A, to: B };

        } catch (error) {
            // Abort Transaction
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
}


main(); 
