(function () {
    var root = new File($.fileName).parent;
    var master, original, rig;
    for (var i = 1; i <= app.project.numItems; i++) {
        var item = app.project.item(i);
        if (item.name === "Sprout_Leaf_Bloom_v02") master = item;
        if (item.name === "Sprout v02 - leaf choreography") rig = item;
    }
    if (!master || !rig) throw new Error("Open the v02 project first.");
    app.beginUndoGroup("Match Sprout card silhouette to original PNG");
    original = master.layer("FINAL - exact original uploaded PNG").source;
    var oldCard = master.layer("Cream card - native editable");
    var card = master.layers.add(original);
    card.name = "Cream card - original alpha silhouette";
    card.moveBefore(oldCard);
    card.property("ADBE Transform Group").property("ADBE Scale").setValue([900/340*100,900/340*100]);
    card.outPoint = 84/30;
    var ramp = card.property("ADBE Effect Parade").addProperty("ADBE Ramp");
    ramp.property("ADBE Ramp-0001").setValue([170,10]);
    ramp.property("ADBE Ramp-0002").setValue([242/255,237/255,234/255,1]);
    ramp.property("ADBE Ramp-0003").setValue([170,330]);
    ramp.property("ADBE Ramp-0004").setValue([231/255,216/255,210/255,1]);
    oldCard.enabled = false;
    oldCard.name = "Archive - native card disabled";
    for (var j = 1; j <= rig.numLayers; j++) rig.layer(j).collapseTransformation = true;
    master.time = 0;
    master.openInViewer();
    app.endUndoGroup();
    app.project.save(new File(root.fsName + "/Sprout Leaf Bloom v02.aep"));
    var frames = [0,24,29,34,42,56,74,84,120];
    for (var f = 0; f < frames.length; f++) master.saveFrameToPng(frames[f]/30, new File(root.fsName+"/QC/frame-"+frames[f]+".png"));
})();
