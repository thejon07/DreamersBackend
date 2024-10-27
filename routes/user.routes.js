const {Router} = require("express")
const uploadmulter = require("../middlewares/multer.middleware")
const {registerUser,loginUser,logoutUser,getCurrentUser,getallusers,getaccesstokenfromrefreshToken,getsearchdata} = require("../controller/user.controller")
const refreshToken = require('../controller/user.controller')
const verifyJwt = require('../middlewares/auth.middleware')
const {getfollowing,getfollowers} = require("../controller/follow.controller")
const {savepost,getFollowedUsersPosts,getuserpost,allpost,readblog} = require("../controller/post.controller")
const router = Router();

router.route("/register").post(
    uploadmulter.single("avatar"), // Pass the field name directly as a string
    registerUser
)

router.route('/login').post(loginUser)
router.route('/logout').get(verifyJwt, logoutUser)
router.route('/follow/:_id').get(getfollowing)
router.route('/follower/:_id').get(getfollowers)
router.route('/postdata/:userid').post(verifyJwt,uploadmulter.single("file"),savepost)
router.route('/allpostdata/:userid').get(getFollowedUsersPosts)
router.route('/getcurrentuser').get(verifyJwt,getCurrentUser)
router.route('/getcurrentuserpost/:userid').get(getuserpost)
router.route('/allusers').get(getallusers)
router.route('/allpost').get(allpost)
router.route('/readblog/:postid').get(readblog)
router.route('/refresh-token').post(getaccesstokenfromrefreshToken)
router.route('/searchpost').post(getsearchdata)

// router.route('/refreshtoken').post(refreshToken)

module.exports = router; 