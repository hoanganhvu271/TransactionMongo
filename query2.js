const { MongoClient } = require('mongodb');
async function main() {
    const uri = 'mongodb://localhost:28081'
    const client = await MongoClient.connect(uri)
    const db = await client.db('hello')

    const session = client.startSession()
    session.startTransaction();


    const opts = { session }
    const opts2 = { session, returnDocument: 'after' }

    //query1
    const sv = await db.collection('SinhVien').countDocuments({ khoa: 'CNTT' }, opts)
    console.log(sv)

    //query2
    const sv2 = await db.collection('SinhVien').countDocuments({ diem: { $gt: 5 } }, opts)
    console.log(sv2)

    //query3
    const sv3 = await db.collection('SinhVien').aggregate([
        {
            $group: {
                _id: null,
                maxScore: { $max: "$diem" }
            }
        }
    ], opts).toArray();
    console.log(sv3)
    const maxScore = sv3[0].maxScore;

    const sv4 = await db.collection('SinhVien').find({ diem: maxScore }, opts).toArray();
    console.log(sv4)

    //query 3
    const sv5 = await db.collection('DangKy').aggregate([
        {
            $group: {
                _id: null,
                count: { $sum: 1 }
            }
        }
    ]).toArray();

    console.log(sv5)

}
main();