const verify = require('../utils/token');
const {testHook} = require('../utils/discord');

module.exports = {
    test: async(req,res) =>{
        try{
            const decoded = verify(req.get('Authorization'));

            if(!decoded){
                return res.status(401).json({message: 'Error with authorization token'})
            }else if(!req.body.discordHook){
                return res.status(422).send({message:'Invalid params'});
            }
            testHook(req.body.discordHook)
            .then((response)=>{
                if(response.status === 200){
                    return res.status(200).json({message:'Webhook worked'});
                }else{
                    return res.status(500).json({message:'Error while trying to test webhook', error: response.error});
                }
            })

        }catch(err){
            return res.status(500).json({message:'Error while trying to test discord hook', error: err.message})
        }
    }
}