import CustomErrorHandler from "../../services/CustomErrorHandler";
import PaytmChecksum from "../payment/config/cheksum";
import PaytmConfig from "../payment/config/config";
import https from "https";
import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});
const handleMultipartData = multer({
  storage,
  limits: { fileSize: 1000000 * 5 },
}).single("image");

const payment = {
  paynow: async (req, res, next) => {
    try {
      handleMultipartData(req, res, (err) => {
        if (err) {
          return next(err);
        }
        const data = req.body;
        console.log(data, "resdat");
        const orderId = "TEST_" + new Date().getTime();
        const paytmParams = {};

        paytmParams.body = {
          requestType: "Payment",
          mid: PaytmConfig.PaytmConfig.mid,
          websiteName: PaytmConfig.PaytmConfig.website,
          orderId: orderId,
          callbackUrl: "http://localhost:4404/api/payment/callback",
          txnAmount: {
            value: data.amount,
            currency: "INR",
          },
          userInfo: {
            custId: data.email,
            email: data.email,
            mobile: data.phone
          },
        };

        PaytmChecksum.generateSignature(
          JSON.stringify(paytmParams.body),
          PaytmConfig.PaytmConfig.key
        ).then(function (checksum) {
          paytmParams.head = {
            signature: checksum,
          };

          var post_data = JSON.stringify(paytmParams);

          var options = {
            /* for Staging */
            hostname: "securegw-stage.paytm.in",

            /* for Production */
            // hostname: 'securegw.paytm.in',

            port: 443,
            path: `/theia/api/v1/initiateTransaction?mid=${PaytmConfig.PaytmConfig.mid}&orderId=${orderId}`,
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Content-Length": post_data.length,
            },
          };

          var response = "";
          var post_req = https.request(options, function (post_res) {
            post_res.on("data", function (chunk) {
              response += chunk;
            });

            post_res.on("end", function () {
              response = JSON.parse(response);
              console.log("txnToken:", response);

              res.status(200).json({
                response: `<html>
                                <head>
                                    <title>Show Payment Page</title>
                                </head>
                                <body>
                                    <center>
                                        <h1>Please do not refresh this page...</h1>
                                    </center>
                                    <form method="post" action="https://securegw-stage.paytm.in/theia/api/v1/showPaymentPage?mid=${PaytmConfig.PaytmConfig.mid}&orderId=${orderId}" name="paytm">
                                        <table border="1">
                                            <tbody>
                                                <input  name="mid" value="${PaytmConfig.PaytmConfig.mid}">
                                                    <input name="orderId" value="${orderId}">
                                                    <input  name="txnToken" value="${response.body.txnToken}">
                                                    <button type="submit" >submit</button>
                                         </tbody>
                                      </table>
                        
                                   </form>
                                </body>
                             </html>`,
              });
            });
          });

          post_req.write(post_data);
          post_req.end();
        });
      });
    } catch (err) {
      next(err);
    }
  },
  callback: (req, res, next) => {
    handleMultipartData(req, res, (err) => {
      if (err) {
        return next(err);
      }
          console.log("callback res", req.body);
        const reqData = req.body

         const data = JSON.parse(JSON.stringify(reqData));

          const paytmChecksum = data.CHECKSUMHASH;

          var isVerifySignature = PaytmChecksum.verifySignature(
            data,
            PaytmConfig.PaytmConfig.key,
            paytmChecksum
          );
          if (isVerifySignature) {
            console.log("Checksum Matched", isVerifySignature);

            var paytmParams = {};

            paytmParams.body = {
              mid: PaytmConfig.PaytmConfig.mid,
              orderId: data.ORDERID,
            };

            PaytmChecksum.generateSignature(
              JSON.stringify(paytmParams.body),
              PaytmConfig.PaytmConfig.key
            ).then(function (checksum) {
              paytmParams.head = {
                signature: checksum,
              };

              var post_data = JSON.stringify(paytmParams);

              var options = {
                /* for Staging */
                hostname: "securegw-stage.paytm.in",

                /* for Production */
                // hostname: 'securegw.paytm.in',

                port: 443,
                path: "/v3/order/status",
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Content-Length": post_data.length,
                },
              };

              // Set up the request
              var response = "";
              var post_req = https.request(options, function (post_res) {
                post_res.on("data", function (chunk) {
                  response += chunk;
                });

                post_res.on("end", function () {
                  console.log("Response: ", response);
                  res.json(response);
                });
              });

              // post the data
              post_req.write(post_data);
              post_req.end();
            });
          } else {
            console.log("Checksum Mismatched");
          }
        
    });
  },
};
export default payment;
