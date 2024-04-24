

const { MongoClient, ObjectId } = require('mongodb');

// Code cho kịch bản trên.
async function main() {
    // Connect

    // Đây phải là 1 replica set.
    const uri = 'mongodb://localhost:27018';
    client = await MongoClient.connect(uri);

    const db = client.db("tmp");
    // await db.dropDatabase();

    // Tạo dữ liệu cho hai tài khoản
    // await db.collection('demo').insertMany([
    //     { name: 'A', balance: 100000, num: 1 },
    //     { name: 'B', balance: 0, num: 10 }
    // ]);

    try {
        // Chuyển tiền từ A sang C nhưng C không tồn tại trong cơ sở dữ liệu.
        await transfer('A', 'B', 50000);

    } catch (error) {
        console.error(error)
        console.log(error.message)
        console.log('\nGiao dịch không thành công\n')
    }

    async function transfer(from, to, amount) {
        const session = client.startSession();
        session.startTransaction();
        try {
            // Tìm kiếm tài khoản 'from'.
            const opts = { session, returnOriginal: true };
            var objectId = new ObjectId("6627d56533f36f355d215bd5");
            const filterFrom = { name: from };
            const resultFrom = await db.collection('demo').findOne(filterFrom);
            if (!resultFrom) {
                throw new Error(`Không tìm thấy tài khoản có tên ${from}`);
            }
            const A = resultFrom;
            const newBalanceA = A.balance - amount;

            console.log("Kiểm tra tài khoản có đủ tiền hay không?")
            if (newBalanceA < 0) {
                throw new Error(`Không đủ tiền trong tài khoản ${from}`);
            }

            console.log("Trừ tiền của " + from)
            await db.collection('demo').updateMany(filterFrom, { $set: { balance: newBalanceA } }, opts);

            console.log("Tìm kiếm tài khoản" + to)
            objectId = new ObjectId("6627d56533f36f355d215bd5");
            const filterTo = { name: to };
            const resultTo = await db.collection('demo').findOne(filterTo);
            if (!resultTo) {
                throw new Error(`Không tìm thấy tài khoản có tên ${to}`);
            }

            console.log("Cộng tiền cho tài khoản " + to)
            const B = resultTo;
            const newBalanceB = B.balance + amount;
            await db.collection('demo').updateMany(filterTo, { $set: { balance: newBalanceB } }, opts);


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


// Chuyển tiền


main(); 
