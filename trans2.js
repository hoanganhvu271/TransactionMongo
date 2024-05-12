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
        const opts = { session }
        const opts2 = { session, returnDocument: 'after' }

        //query1

        await db.createCollection('SinhVien', opts)
        // await db.collection('SinhVien').insertOne({ msv: "CN001", ten: "Nguyen Van A", lop: "CNTT1", diem: 9 }, opts)
        // await db.collection('SinhVien').deleteOne({ msv: "CN001" })
        await db.collection('SinhVien').insertMany(
            [{
                "msv": "CN001",
                "ten": "Nguyễn Văn A",
                "lop": "CNTT1",
                "khoa": "CNTT",
                "diem": 8.5
            },
            {
                "msv": "CN002",
                "ten": "Nguyễn Văn B",
                "lop": "CNTT2",
                "khoa": "CNTT",
                "diem": 9.5
            },
            {
                "msv": "CN003",
                "ten": "Nguyễn Văn C",
                "lop": "CNTT3",
                "khoa": "CNTT",
                "diem": 7.5
            },
            {
                "msv": "CN004",
                "ten": "Nguyễn Văn D",
                "lop": "CNTT4",
                "khoa": "CNTT",
                "diem": 6.5
            },
            {
                "msv": "CN005",
                "ten": "Nguyễn Văn E",
                "lop": "CNTT5",
                "khoa": "CNTT",
                "diem": 5.5
            },
            {
                "msv": "CN006",
                "ten": "Nguyễn Văn F",
                "lop": "CNTT6",
                "khoa": "CNTT",
                "diem": 4.5
            },
            {
                "msv": "CN007",
                "ten": "Nguyễn Văn G",
                "lop": "CNTT7",
                "khoa": "CNTT",
                "diem": 3.5
            },
            {
                "msv": "CN008",
                "ten": "Nguyễn Văn H",
                "lop": "CNTT8",
                "khoa": "CNTT",
                "diem": 2.5
            },
            {
                "msv": "CN009",
                "ten": "Nguyễn Văn I",
                "lop": "CNTT9",
                "khoa": "CNTT",
                "diem": 1.5
            },
            {
                "msv": "CN010",
                "ten": "Nguyễn Văn K",
                "lop": "CNTT10",
                "khoa": "CNTT",
                "diem": 0.5
            }], opts
        )


        //query2

        await db.createCollection("DangKy", opts)
        await db.collection('DangKy').insertMany([
            {
                "id_sv": "CN001",
                "id_mh": "MH001",
                "thoi_gian": "2021-01-01"
            },
            {
                "id_sv": "CN002",
                "id_mh": "MH002",
                "thoi_gian": "2021-01-02"
            },
            {
                "id_sv": "CN003",
                "id_mh": "MH003",
                "thoi_gian": "2021-01-03"
            },
            {
                "id_sv": "CN004",
                "id_mh": "MH004",
                "thoi_gian": "2021-01-04"
            },
            {
                "id_sv": "CN005",
                "id_mh": "MH005",
                "thoi_gian": "2021-01-05"
            },
            {
                "id_sv": "CN006",
                "id_mh": "MH006",
                "thoi_gian": "2021-01-06"
            },
            {
                "id_sv": "CN007",
                "id_mh": "MH007",
                "thoi_gian": "2021-01-07"
            },
            {
                "id_sv": "CN008",
                "id_mh": "MH008",
                "thoi_gian": "2021-01-08"
            },
            {
                "id_sv": "CN009",
                "id_mh": "MH009",
                "thoi_gian": "2021-01-09"
            },
            {
                "id_sv": "CN010",
                "id_mh": "MH010",
                "thoi_gian": "2021-01-10"
            }
        ], opts)



        await session.commitTransaction()
        await session.endSession()
    }
    catch (e) {
        console.log(e)
        await session.abortTransaction()
        await session.endSession()
    }
}
main()