(function () {
    var root = new File($.fileName).parent;
    var compName = "Sprout_Leaf_Bloom_v02";
    var fps = 30, duration = 4.4, icon = 900, factor = icon / 340;
    function output(name, body) {
        // Logging must not invalidate a successfully saved project when AE file I/O is disabled.
        try { var f = new File(root.fsName + "/" + name); if (f.open("w")) { f.write(body); f.close(); } }
        catch (loggingError) { $.writeln(body); }
    }
    function tr(layer, name) { return layer.property("ADBE Transform Group").property(name); }
    function ease(p) {
        var dim = p.propertyValueType === PropertyValueType.TwoD || p.propertyValueType === PropertyValueType.ThreeD ? p.value.length : 1;
        for (var k = 1; k <= p.numKeys; k++) {
            var a = [], b = [];
            for (var d = 0; d < dim; d++) { a.push(new KeyframeEase(0, k === 1 ? 20 : 75)); b.push(new KeyframeEase(0, k === 1 ? 25 : 50)); }
            p.setInterpolationTypeAtKey(k, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
            p.setTemporalEaseAtKey(k, a, b);
        }
    }
    function keys(layer, name, frames, vals) {
        var p = tr(layer, name);
        for (var i = 0; i < frames.length; i++) p.setValueAtTime(frames[i] / fps, vals[i]);
        ease(p);
    }
    function importMedia(name) { return app.project.importFile(new ImportOptions(new File(root.fsName + "/Media/" + name))); }
    function mask(layer, vertices) {
        var m = layer.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
        m.name = "Editable component boundary";
        var s = new Shape(); s.vertices = vertices; s.closed = true;
        var tangents = []; for (var i = 0; i < vertices.length; i++) tangents.push([0, 0]);
        s.inTangents = tangents; s.outTangents = tangents;
        m.property("ADBE Mask Shape").setValue(s);
        m.property("ADBE Mask Offset").setValue(0.15);
        return m;
    }
    try {
        for (var i = 1; i <= app.project.numItems; i++) if (app.project.item(i).name === compName) throw new Error("Iteration already exists; inspect before rebuilding.");
        app.project.save(new File(root.fsName + "/Before v02 Backup.aep"));
        app.beginUndoGroup("Sprout four-leaf bloom v02");
        var folder = app.project.items.addFolder("Sprout v02 - editable leaf bloom");
        var original = importMedia("Sprout Original.png"), texture = importMedia("Sprout Clover.png");
        original.parentFolder = folder; texture.parentFolder = folder;
        var master = app.project.items.addComp(compName, 1080, 1080, 1, duration, fps);
        master.parentFolder = folder; master.motionBlur = true; master.shutterAngle = 120;
        master.layers.addSolid([0.98, 0.975, 0.966], "Canvas", 1080, 1080, 1, duration);
        var card = master.layers.addShape(); card.name = "Cream card - native editable";
        var contents = card.property("ADBE Root Vectors Group");
        var rect = contents.addProperty("ADBE Vector Shape - Rect");
        rect.property("ADBE Vector Rect Size").setValue([320 * factor, 320 * factor]);
        rect.property("ADBE Vector Rect Roundness").setValue(76 * factor);
        var fill = contents.addProperty("ADBE Vector Graphic - Fill"); fill.property("ADBE Vector Fill Color").setValue([0.94, 0.91, 0.89]);
        tr(card, "ADBE Position").setValue([540, 540]);
        var ramp = card.property("ADBE Effect Parade").addProperty("ADBE Ramp");
        ramp.property("ADBE Ramp-0001").setValue([540, 90 + 10 * factor]);
        ramp.property("ADBE Ramp-0002").setValue([242/255,237/255,234/255,1]);
        ramp.property("ADBE Ramp-0003").setValue([540, 90 + 330 * factor]);
        ramp.property("ADBE Ramp-0004").setValue([231/255,216/255,210/255,1]);
        var rig = app.project.items.addComp("Sprout v02 - leaf choreography", icon, icon, 1, duration, fps);
        rig.parentFolder = folder; rig.motionBlur = true; rig.shutterAngle = 120;
        var parts = [
            {name:"01 Upper right - first leaf",start:0,poly:[[169,159],[169,0],[340,0],[340,157]],first:true},
            {name:"02 Lower right",start:24,poly:[[169,159],[340,157],[340,340],[198,340],[198,264],[181,232],[174,205],[172,176]]},
            {name:"03 Lower left",start:29,poly:[[169,159],[166,178],[166,213],[160,249],[148,280],[0,340],[0,159]]},
            {name:"04 Upper left",start:34,poly:[[169,159],[0,159],[0,0],[169,0]]},
            {name:"05 Stem",start:45,poly:[[169,159],[172,176],[174,205],[181,232],[198,264],[198,340],[148,340],[148,280],[160,249],[166,213],[166,178]],stem:true}
        ];
        var anchor = [169 * factor,159 * factor];
        for (var j = parts.length - 1; j >= 0; j--) {
            var part = parts[j];
            var source = app.project.items.addComp("Sprout v02 - " + part.name,340,340,1,duration,fps);
            source.parentFolder = folder;
            var media = source.layers.add(texture); media.name = "Original embroidery - masked";
            mask(media,part.poly);
            var layer = rig.layers.add(source); layer.name = part.name;
            tr(layer,"ADBE Anchor Point").setValue([169,159]);
            tr(layer,"ADBE Position").setValue(anchor);
            tr(layer,"ADBE Scale").setValue([factor*100,factor*100]);
            layer.motionBlur = !part.first;
            if (!part.first) {
                var t = part.start;
                keys(layer,"ADBE Scale",[t,t+17,t+23],part.stem ? [[factor*100,factor*2],[factor*100,factor*101],[factor*100,factor*100]] : [[factor*32,factor*32],[factor*101.5,factor*101.5],[factor*100,factor*100]]);
                if (!part.stem) keys(layer,"ADBE Rotate Z",[t,t+20],[-24,0]);
                keys(layer,"ADBE Opacity",[t,t+4],[0,100]);
            }
        }
        var bloom = master.layers.add(rig); bloom.name = "Leaf bloom - open to edit timing";
        tr(bloom,"ADBE Position").setValue([540,540]);
        var finalLayer = master.layers.add(original); finalLayer.name = "FINAL - exact original uploaded PNG";
        tr(finalLayer,"ADBE Position").setValue([540,540]);
        tr(finalLayer,"ADBE Scale").setValue([factor*100,factor*100]);
        keys(finalLayer,"ADBE Opacity",[74,84],[0,100]);
        bloom.outPoint = 84/fps; card.outPoint = 84/fps;
        var markers = [[0,"ONE LEAF: upper right"],[24,"CLOCKWISE: lower right"],[29,"Lower left"],[34,"Upper left"],[45,"Stem opens"],[84,"Original PNG final hold"]];
        for(var k=0;k<markers.length;k++) master.markerProperty.setValueAtTime(markers[k][0]/fps,new MarkerValue(markers[k][1]));
        master.time = 3; master.openInViewer();
        app.project.save(new File(root.fsName + "/Sprout Leaf Bloom v02.aep"));
        var frames=[0,24,29,34,42,56,74,84,120];
        for(var q=0;q<frames.length;q++) master.saveFrameToPng(frames[q]/fps,new File(root.fsName+"/QC/frame-"+frames[q]+".png"));
        // Independent source-only comp proves final pose uses the original PNG unchanged.
        var ref=app.project.items.addComp("Sprout v02 - final source reference",1080,1080,1,duration,fps);ref.parentFolder=folder;
        ref.layers.addSolid([0.98,0.975,0.966],"Canvas",1080,1080,1,duration);
        var refLogo=ref.layers.add(original);tr(refLogo,"ADBE Scale").setValue([factor*100,factor*100]);
        ref.saveFrameToPng(3,new File(root.fsName+"/QC/source-reference.png"));
        master.openInViewer(); app.project.save(new File(root.fsName + "/Sprout Leaf Bloom v02.aep"));
        app.endUndoGroup();
        output("build-status.txt","SUCCESS\nComposition: "+compName+"\nFirst frame: upper right only\nFinal source: Sprout Original.png\nDuration: "+duration+"\nFPS: "+fps);
    } catch(e) { output("build-status.txt","ERROR line "+e.line+": "+e.toString()); alert(e.toString()); }
})();
