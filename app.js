// Kịch bản sử dụng đến Transaction khi thanh toán online vé tàu:
// Tài khoản khách hàng A thực hiện thanh toán tới trụ sở B (A và B có thể ở 2 shard khác nhau):
// Kịch bản:
// --> Luồng chương trình:
//    1. Tìm tài khoản có tên A.
//    2. Kiểm tra số dư trong tài khoản A có đủ không.
//    3. Nếu đủ thì trừ tiền trong tài khoản A.
//    4. Tìm kiếm tài khoản tên B
//    5. Cộng tiền vào tài khoản B.
// --> Nếu không có transaction:
//    +. Giả sử lỗi ở 4, thì tài khoản A đã bị trừ tiền nhưng tài khoản B không được cộng tiền, giao dịch không hoàn thành.
// --> Nếu có transaction:
//    +. Nếu lỗi ở bất kỳ bước nào, abortTransaction() được gọi, thì tài khoản A sẽ không bị trừ tiền.

const { MongoClient } = require('mongodb');

// Code cho kịch bản trên.
async function main() {
    // Connect

    // Đây phải là 1 replica set.
    const uri = 'mongodb://localhost:28081';
    client = await MongoClient.connect(uri);

    const db = client.db();
    await db.dropDatabase();

    // Tạo dữ liệu cho hai tài khoản
    await db.collection('Account').insertMany([
        { name: 'A', balance: 100000 },
        { name: 'B', balance: 0 }
    ]);

    try {
        // Chuyển tiền từ A sang C nhưng C không tồn tại trong cơ sở dữ liệu.
        await transfer('A', 'C', 50000);

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
            const filterFrom = { name: from };
            const resultFrom = await db.collection('Account').findOne(filterFrom);
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
            await db.collection('Account').updateOne(filterFrom, { $set: { balance: newBalanceA } }, opts);

            console.log("Tìm kiếm tài khoản" + to)
            const filterTo = { name: to };
            const resultTo = await db.collection('Account').findOne(filterTo);
            if (!resultTo) {
                throw new Error(`Không tìm thấy tài khoản có tên ${to}`);
            }

            console.log("Cộng tiền cho tài khoản " + to)
            const B = resultTo;
            const newBalanceB = B.balance + amount;
            await db.collection('Account').updateOne(filterTo, { $set: { balance: newBalanceB } }, opts);


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
