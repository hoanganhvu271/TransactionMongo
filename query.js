const { MongoClient } = require('mongodb')

async function main() {
    const uri = 'mongodb://localhost:28081'
    client = await MongoClient.connect(uri)

    const db = await client.db('hello')

    const session = client.startSession()
    session.startTransaction()

    try {
        const opts = { session, returnSession: true }
        const opts2 = { session, returnDocument: 'after' }

        //Lấy ra tên tất cả sinh viên khoa 'CNTT'

        const sv = await db.collection('DangKy').aggregate([
            {
                $match: {
                    id_mh: "MH001"
                }
            }
            ,
            {
                $lookup: {
                    from: 'SinhVien',
                    localField: 'id_sv',
                    foreignField: 'msv',
                    as: 'StudentInfo'
                }
            },
            {
                $unwind:
                    "$StudentInfo"

            },
            {
                $project: {
                    "StudentInfo.ten": 1
                }
            }
        ], opts).toArray()

        console.log(sv)

        // Xóa tất cả các môn học được đăng ký bởi sinh viên lớp CNTT1
        // const mh = await db.collection('SinhVien').aggregate([
        //     {
        //         $match: {
        //             lop: "CNTT1"
        //         }

        //     },
        //     {
        //         $lookup: {
        //             from: 'DangKy',
        //             localField: 'msv',
        //             foreignField: 'id_sv',
        //             as: "sv2"
        //         },

        //     },
        //     {
        //         $unwind: "$sv2"
        //     },
        //     {
        //         $project: {
        //             "sv2.id_mh": 1
        //         }
        //     }
        // ], opts).toArray()



        // console.log(mh[0].sv2.id_mh)
        // await db.collection('DangKy').deleteOne({ id_mh: mh[0].sv2.id_mh }, opts)

        const countsv = await db.collection('SinhVien').countDocuments({ khoa: "CNTT" }, opts)
        console.log(countsv)

        await session.commitTransaction()
        session.endSession()

        // số lượng sinh viên khoa CNTT

    }
    catch (e) {
        console.log(e)
        await session.abortTransaction()
        session.endSession()
    }
}
main()