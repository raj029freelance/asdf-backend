const Search = require("../model/searchModel");

exports.getAllSearches =  async (req,res)=>{

    try {
      const searches = await Search.find();
      res.status(200).json({
          result : searches.length,
          searches : searches
      })
    }
    catch (err) {
        res.status(400).json({
            status: 404,
            message: err
          });
    }
}

exports.addRecentSearch = async (req,res) => {
    try{
        const {organization_id , organization_name} = req.body;
        if(!(organization_id && organization_name)) {
            return res.status(400).json({
                message  :"organization id or name must be missing"
            })
        }
        const docCount = await Search.countDocuments({}).exec();
        const search = new Search({
            organization_id,
            organization_name
        })
        if(docCount === 10) {
            await Search.findOneAndDelete({},{sort : {"organization_id" : - 1}});     
        }
        const newSearch = await search.save();
        res.status(200).json({
            status : "successfull",
            search  :newSearch
        })


    } catch(err) {
         res.status(400).json({
             message : err
         })
    }
}