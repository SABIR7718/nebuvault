/*
 * © 2026 SeXyxeon (VOIDSEC)
 *
 * ⚠️ COPYRIGHT NOTICE
 * This source code is protected under copyright law.
 * Any form of re-uploading, recoding, modification,
 * selling, or redistribution WITHOUT explicit permission
 * from the original author is strictly prohibited.
 *
 * ❌ NO CREDIT = NO PERMISSION
 * ❌ DO NOT CLAIM THIS CODE AS YOUR OWN
 *
 * ✔️ Usage or modification is allowed ONLY
 * with prior permission and proper credit.
 *
 * OFFICIAL LINKS (ONLY):
 * YouTube   : https://youtube.com/@voidsec7718
 * Instagram : sabir._7718
 * Telegram  : https://t.me/SABIR7718
 * GitHub    : https://github.com/SABIR7718
 * WhatsApp  : +91 73650 85213
 *
 * Violations may result in DMCA takedown
 * or termination of the Telegram bot.
 */

require('dotenv').config()
const fs = require('fs')
const express = require('express')
const rateLimit = require('express-rate-limit')
const multer = require('multer')
const mongoose = require('mongoose')
const {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand
} = require('@aws-sdk/client-s3')
const {
    log
} = require('@sabir7718/log')
const crypto = require('crypto')
const cors = require('cors')
const os = require('os')

const app = express()

app.use(cors({

    origin: [

        'https://nebuvault.sabir7718.com',

        'https://api.nebuvault.sabir7718.com'

    ],

    methods: [

        'GET',
        'POST'

    ],

    credentials: true

}))

const S7Temp = './temp'

if (!fs.existsSync(S7Temp)) {
    fs.mkdirSync(
        S7Temp, {
            recursive: true
        }
    )
}

function S7HaTeAPI(req, res, next) {

    const S7Host =
        req.headers[
            'x-forwarded-host'
        ] ||
        req.get('host')

    const S7Allow = [

        'api.nebuvault.sabir7718.com',

        'file.nebuvault.sabir7718.com'


    ]

    if (
        !S7Allow.includes(
            S7Host
        )
    ) {

        return res.status(403).json({

            developer: 'SABIR7718',

            success: false,

            message: 'API access denied'

        })

    }

    next()

}

app.use(
    rateLimit({

        windowMs: 60000,

        max: 30

    })
)

app.use(
    ['/upload', '/clearall', '/'],
    S7HaTeAPI
)

app.use(cors())

mongoose.connect(process.env.MONGO_URI)
    .then(() => log('success', 'SYSTEM', 'Mongo Connected'))
    .catch(e => log('error', 'SYSTEM', e.message))

const S7Schema = new mongoose.Schema({
    S7HaTe: {
        type: String,
        required: true,
        unique: true
    },
    SYHaTe: {
        type: String,
        required: true
    },
    HaTe: {
        type: String,
        required: true
    },
    S7: {
        type: Number,
        required: true
    },

    S7Server: {
        type: Number,
        default: 1
    },

    expiresAt: {
        type: Date,
        required: true,
        index: {
            expires: 0
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const S7Model = mongoose.model('files', S7Schema)

const S7R2Pool = []

for (let S7 = 1; S7 <= 50; S7++) {

    const S7Num = S7 === 1 ? '' : S7

    const S7Endpoint =
        process.env[
            `R2_ENDPOINT${S7Num}`
        ]

    const S7Access =
        process.env[
            `R2_ACCESS_KEY_ID${S7Num}`
        ]

    const S7Secret =
        process.env[
            `R2_SECRET_ACCESS_KEY${S7Num}`
        ]

    if (
        S7Endpoint &&
        S7Access &&
        S7Secret
    ) {

        S7R2Pool.push(

            new S3Client({

                region: 'auto',

                endpoint: S7Endpoint,

                credentials: {

                    accessKeyId: S7Access,

                    secretAccessKey: S7Secret

                }

            })

        )

        log(
            'success',
            'SYSTEM',
            `R2 #${S7} loaded`
        )

    }

}

if (!S7R2Pool.length) {

    throw new Error(
        'No R2 Servers Found'
    )

}

let S7HaTeSYIndex = 0

function S7R2() {

    const S7 =
        S7R2Pool[
            S7HaTeSYIndex
        ]

    S7HaTeSYIndex++

    if (
        S7HaTeSYIndex >=
        S7R2Pool.length
    ) {

        S7HaTeSYIndex = 0

    }

    return S7

}

const S7Upload = multer({
    storage: multer.diskStorage({

        destination: (req, file, cb) => {
            cb(null, S7Temp)
        },

        filename: (req, file, cb) => {

            cb(
                null,

                Date.now() +
                '-' +
                file.originalname
            )

        }

    }),

    limits: {
        fileSize: 250 * 1024 * 1024
    }

})

async function S7HaTeDeleteOld() {

    const oldestFile =
        await S7Model.findOne().sort({
            createdAt: 1
        })

    if (!oldestFile) return

    try {

        await oldestFile.deleteOne()

        log(
            'info',
            'SYSTEM',
            'Storage full. Deleted oldest file successfully'
        )

    } catch (e) {

        log(
            'error',
            'SYSTEM',
            `Fallback deletion failed: ${e.message}`
        )

    }

}

S7Schema.pre(
    'deleteOne', {
        document: true,
        query: false
    },
    async function(next) {

        try {

            const S7ServerClient =

                S7R2Pool[
                    (this.S7Server || 1) - 1
                ]

            await S7ServerClient.send(

                new DeleteObjectCommand({

                    Bucket: process.env.R2_BUCKET,

                    Key: this.S7HaTe

                })

            )

            log(
                'success',
                'CLEANUP',
                `Deleted R2 Object: ${this.S7HaTe}`
            )

        } catch (e) {

            log(
                'error',
                'CLEANUP',
                `Failed to delete R2 object: ${e.message}`
            )

        }

        next()

    })

app.get('/', async (req, res) => {

    try {

        const S7Files = await S7Model.find({},
            'S7HaTe SYHaTe S7 createdAt expiresAt S7Server'
        )

        const S7Count = S7Files.length

        const S7Bytes = S7Files.reduce(
            (a, b) => a + b.S7,
            0
        )

        const S7MB = (
            S7Bytes / 1024 / 1024
        ).toFixed(2)

        const S7GB = (
            S7Bytes / 1024 / 1024 / 1024
        ).toFixed(2)

        const S7Limit =
            10 * S7R2Pool.length

        const S7Percent = (
            (S7GB / S7Limit) * 100
        ).toFixed(2)

        const S7Up = Math.floor(
            process.uptime()
        )

        const S7Days = Math.floor(
            S7Up / 86400
        )

        const S7Hours = Math.floor(
            (S7Up % 86400) / 3600
        )

        const S7Minutes = Math.floor(
            (S7Up % 3600) / 60
        )

        const S7Seconds =
            S7Up % 60

        const S7Links = S7Files.map(
            v => ({
                name: v.SYHaTe,
                size: (
                    v.S7 / 1024 / 1024
                ).toFixed(2) + ' MB',
                url: `https://file.nebuvault.sabir7718.com/f/${v.S7HaTe}`,
                expires: v.expiresAt,
                server: Number(
                    v.S7Server || 1
                )
            })
        )

        const S7ServerStats = []

        for (
            let S7 = 1; S7 <= S7R2Pool.length; S7++
        ) {

            const S7ServerFiles =
                S7Files.filter(
                    x => (x.S7Server || 1) === S7
                )

            const S7ServerBytes =
                S7ServerFiles.reduce(
                    (a, b) => a + b.S7,
                    0
                )

            S7ServerStats.push({

                server: S7,

                files: S7ServerFiles.length,

                usedMB: (
                    S7ServerBytes /
                    1024 /
                    1024
                ).toFixed(2) + ' MB',

                usedGB: (
                    S7ServerBytes /
                    1024 /
                    1024 /
                    1024
                ).toFixed(2),

                links: S7ServerFiles.map(
                    v => ({
                        name: v.SYHaTe,
                        url: `https://file.nebuvault.sabir7718.com/f/${v.S7HaTe}`
                    })
                )

            })

        }

        const S7CPU = os.cpus()

        res.json({

            developer: 'SABIR7718',

            success: true,

            r2: {

                loaded: S7R2Pool.length,

                current: S7HaTeSYIndex + 1,

                servers: S7ServerStats

            },

            storage: {

                usedMB: S7MB,

                usedGB: S7GB,

                freeGB: (
                    S7Limit - S7GB
                ).toFixed(2),

                limitGB: S7Limit,

                usedPercent: S7Percent + '%'

            },

            files: {

                count: S7Count,

                links: S7Links

            },

            system: {

                uptime: `${S7Days}d ${S7Hours}h ${S7Minutes}m ${S7Seconds}s`,

                memory: {

                    used: (
                        process.memoryUsage().rss /
                        1024 /
                        1024
                    ).toFixed(2) + ' MB',

                    heap: (
                        process.memoryUsage().heapUsed /
                        1024 /
                        1024
                    ).toFixed(2) + ' MB'

                },

                cpu: S7CPU?.[0]?.model ||
                    'Android/Termux CPU',

                platform: process.platform,

                node: process.version

            }

        })

    } catch (e) {

        log(
            'error',
            'INFO',
            e.message
        )

        res.json({

            developer: 'SABIR7718',

            success: false,

            error: e.message

        })

    }

})

app.post('/upload', S7Upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                developer: 'SABIR7718',
                success: false,
                message: 'No file uploaded'
            })
        }

        const cleanName = req.file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '')
        const uniqueID = crypto.randomBytes(4).toString('hex')
        const S7ID = `${uniqueID}-${cleanName}`

        const S7UploadParams = () => ({

            Bucket: process.env.R2_BUCKET,

            Key: S7ID,

            Body: fs.createReadStream(
                req.file.path
            ),

            ContentType: req.file.mimetype

        })

        const S7CurrentServer =
            S7HaTeSYIndex + 1

        const S7Client =
            S7R2Pool[
                S7HaTeSYIndex
            ]

        S7HaTeSYIndex++

        if (
            S7HaTeSYIndex >=
            S7R2Pool.length
        ) {
            S7HaTeSYIndex = 0
        }

        try {

            await S7Client.send(
                new PutObjectCommand(
                    S7UploadParams()
                )
            )

        } catch (e) {

            await S7HaTeDeleteOld()

            await S7Client.send(
                new PutObjectCommand(
                    S7UploadParams()
                )
            )

        }

        const S7SizeMB = req.file.size / (1024 * 1024)

        let S7HaTeSYExpire

        if (S7SizeMB <= 1) {
            S7HaTeSYExpire = 365
        } else if (S7SizeMB <= 5) {
            S7HaTeSYExpire = 240
        } else if (S7SizeMB <= 20) {
            S7HaTeSYExpire = 180
        } else if (S7SizeMB <= 50) {
            S7HaTeSYExpire = 120
        } else if (S7SizeMB <= 100) {
            S7HaTeSYExpire = 90
        } else {
            S7HaTeSYExpire = 60
        }

        await S7Model.create({
            S7HaTe: S7ID,
            SYHaTe: req.file.originalname,
            HaTe: req.file.mimetype,
            S7: req.file.size,
            S7Server: S7CurrentServer,
            expiresAt: new Date(
                Date.now() + (S7HaTeSYExpire * 86400000)
            )
        })

        if (req.file?.path) {

            fs.unlink(
                req.file.path,
                () => {}
            )

        }

        log('success', 'UPLOAD', S7ID)
        res.json({
            developer: 'SABIR7718',
            success: true,
            url: `https://file.nebuvault.sabir7718.com/f/${S7ID}`,
            expires: `${S7HaTeSYExpire} day(s)`
        })
    } catch (e) {
        log('error', 'UPLOAD', e.message)
        if (req.file?.path) {

            fs.unlink(
                req.file.path,
                () => {}
            )

        }
        res.status(500).json({
            developer: 'SABIR7718',
            success: false,
            error: e.message
        })
    }
})

app.post('/clearall', express.json(), async (req, res) => {

    try {

        const {
            password
        } = req.body

        if (
            password !==
            process.env.CLEAR_PASSWORD
        ) {

            return res.status(401).json({
                developer: 'SABIR7718',
                success: false,
                message: 'Wrong password'
            })

        }

        const S7HaTeSY =
            await S7Model.find()

        for (
            const S7 of S7HaTeSY
        ) {

            try {

                const S7ServerClient =

                    S7R2Pool[
                        (S7.S7Server || 1) - 1
                    ]

                await S7ServerClient.send(

                    new DeleteObjectCommand({

                        Bucket: process.env.R2_BUCKET,

                        Key: S7.S7HaTe

                    })

                )

            } catch (e) {

                log(
                    'error',
                    'CLEARALL',
                    e.message
                )

            }

        }

        await S7Model.deleteMany({})

        log(
            'success',
            'SYSTEM',
            'ALL FILES CLEARED'
        )

        res.json({

            developer: 'SABIR7718',

            success: true,

            message: 'All files deleted',

            count: S7HaTeSY.length

        })

    } catch (e) {

        log(
            'error',
            'CLEARALL',
            e.message
        )

        res.status(500).json({

            developer: 'SABIR7718',

            success: false,

            error: e.message

        })

    }

})

app.get('/f/:id', async (req, res) => {

    const S7Host =
        req.headers['x-forwarded-host'] ||
        req.get('host')

    if (
        S7Host !==
        'file.nebuvault.sabir7718.com'
    ) {

        log(
            'info',
            'HOST',
            JSON.stringify({
                xf: req.headers['x-forwarded-host'],
                host: req.get('host')
            })
        )

        return res.status(403).json({

            developer: 'SABIR7718',

            success: false,

            message: 'Access denied'

        })

    }

    try {

        const fileData = await S7Model.findOne({
            S7HaTe: req.params.id
        })

        if (!fileData) {
            return res.status(404).json({
                developer: 'SABIR7718',
                success: false,
                message: 'File not found or expired'
            })
        }

        const S7Now = new Date()

        const S7RemainingHours =
            (
                fileData.expiresAt - S7Now
            ) / (1000 * 60 * 60)

        if (S7RemainingHours <= 24) {

            const S7NewExpire =
                new Date(
                    fileData.expiresAt.getTime() +
                    (50 * 86400000)
                )

            fileData.expiresAt =
                S7NewExpire

            await fileData.save()

            log(
                'info',
                'EXPIRE',
                `${fileData.S7HaTe} +50 days extended`
            )

        }

        const S7ServerClient =

            S7R2Pool[
                (fileData.S7Server || 1) - 1
            ]

        const S7HaTeSY =
            await S7ServerClient.send(
                new GetObjectCommand({
                    Bucket: process.env.R2_BUCKET,
                    Key: fileData.S7HaTe
                })
            )

        res.setHeader(
            'Content-Type',
            fileData.HaTe
        )

        res.setHeader(
            'Content-Disposition',
            `inline; filename="${fileData.SYHaTe}"`
        )

        S7HaTeSY.Body.pipe(res)

    } catch (e) {

        log(
            'error',
            'DOWNLOAD',
            e.message
        )

        res.status(500).json({
            developer: 'SABIR7718',
            success: false,
            error: e.message
        })

    }
})

app.use((e, req, res, next) => {
    if (e.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            developer: 'SABIR7718',
            success: false,
            message: 'Max file size 250MB'
        })
    }
    res.status(500).json({
        developer: 'SABIR7718',
        success: false,
        error: e.message
    })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => log('success', 'SYSTEM', `S7 FileDrop Running on port ${PORT}`))

if (process.env.URL) {

    (async () => {
        try {
            const res = await fetch(process.env.URL);
            log('info', 'PING', `Pinged: ${process.env.URL} | Status: ${res.status}`);
        } catch (err) {
            log('error', 'PING', err.message);
        }
    })();

    setInterval(async () => {
        try {
            const res = await fetch(process.env.URL);
            log('info', 'PING', `Pinged: ${process.env.URL} | Status: ${res.status}`);
        } catch (err) {
            log('error', 'PING', err.message);
        }
    }, 5 * 60 * 1000);
}