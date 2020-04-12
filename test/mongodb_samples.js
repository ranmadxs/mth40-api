db.armies.find({"factions.name": "Orks"})
   .projection({})
   .sort({_id:-1})
   .limit(100)

//db.armies.drop()
   
db.armies.find( { name: "Xenos" },
                 { name: 1, factions: { $elemMatch: { name: {$eq :"Orks"} } } } )   