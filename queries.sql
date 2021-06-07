db.unitscores.find({_id: ObjectId("5efc293513a54c6154798055")})
   .projection({})
   .sort({_id:-1})
   .limit(100)
   

db.unitscores.find({unitId: "1e59-13da-768f-21c3"})
   .projection({})
   .sort({_id:-1})
   .limit(100)

db.unitscores.aggregate(
   [
     {"$match":{"rosterTournament": ObjectId("5eedc1c908317b1cd8212b0e")}},
     {
        $group: {
           _id: {unitId: "$unitId"},   
           scoreTotal: { $sum: "$score"},
           scoreAvg: { $avg: "$score"},
           offKillTotal: { $sum: "$offensive.kill" },
           offKillAvg: { $avg: "$offensive.kill" },
           offWoundTotal: { $sum: "$offensive.wound" },
           offWoundAvg: { $avg: "$offensive.wound" },
           count: {$sum: 1}
        },
     },
     {$sort:  {'scoreTotal': -1}},     
   ]
)

db.unitscores.aggregate([
   {
     $lookup:
       {
         from: "rosters",
         localField: "unitId",
         foreignField: "forces.units.id",
         as: "unitObject"
       }
  }
])

db.unitscores.aggregate(
   [
     {"$match":{"unitId": "1e59-13da-768f-21c3"}},
     {
        $project: {
           scoreTotal: { $sum: "$score"},
           offKillTotal: { $sum: "$offensive.kill" },
           offWoundTotal: { $sum: "$offensive.wound" }
        }
     }
   ]
)

   
db.rosters.aggregate([
  {"$unwind":"$forces"},
  {"$unwind":"$forces.units"},  
  {"$match":{"forces.units.id": "1e59-13da-768f-21c3"}}])   