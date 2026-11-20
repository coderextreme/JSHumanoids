var System = Java.type("java.lang.System");
System.setProperty("polyglot.js.nashorn-compat", "true");

load('data/X3Dautoclass.js');
// imports X3D0

main();

function main() {
	var count = 0;
	var humans = "";
	var scene = X3D0.getScene();
	for (const humanoid of traverseChildrenSceneGraph(scene.getChildren())){
		count++;
		// print("humanoid", typeof humanoid, humanoid, JSON.stringify(humanoid));
		humans += humanoid.getName();
		// print(humanoid.getName());
		print(humanoid.getDEF());
		var scale = humanoid.getScale();
		// print("scale", JSON.stringify(scale));
		print("scale input", scale);
		humanoid.setScale(Java.to([ 1, 1, 1 ], Java.type("double[]")));
		print("scale output", humanoid.getScale());
		var translation = [0, 0, 0];
		transformNode(scene, translation, scale, X3D0);

		scale = [ 1, 1, 1 ];
	}
        X3D0.toFileX3D("../data/"+humans+".scaled"+count+".x3d");
}

function* traverseChildrenSceneGraph(children) {
	if (children !== null) {
		// print("children", typeof children, JSON.stringify(children));
		for (const child in children) {
			for (const humanoid of traverseChildSceneGraph(children[child])) {
				if (humanoid) {
					// print("Unpacking child in "+child+" succeeded");
					yield humanoid;
				} else {
					// print("Unpacking child in "+child+" failed");
				}
			}
		}
	}
	return null;
}

function* traverseChildSceneGraph(child) {
	if (child.getClass().getName().endsWith("HAnimHumanoid")) {
		// print("humanoid", typeof child, JSON.stringify(child));
		yield child;
	} else if (child !== null) {
		if ("getChildrenList" in child) {
			var children = child.getChildrenList();
			// print("children traverse", typeof child, JSON.stringify(child));
			for (const humanoid of traverseChildrenSceneGraph(children)) {
				yield humanoid;
			}
		} else {
			// print("No children, child is "+child);
			return null;
		}
	} else {
		// print("Null child is "+child);
		return null;
	}
	return null;
}

function transformPoint(point, point_offset, translation, scale) {
	var newPoint = point.map(item => item);
	//print("");
	//print("point_offset", point_offset);
	//print("in  trans", translation[0], translation[1], translation[2]);
	//print("in  scale", scale[0], scale[1], scale[2]);
	print("in  point", point[point_offset+0], point[point_offset+1], point[point_offset+2]);

	newPoint[point_offset+0] = newPoint[point_offset+0] + translation[0];
	newPoint[point_offset+1] = newPoint[point_offset+1] + translation[1];
	newPoint[point_offset+2] = newPoint[point_offset+2] + translation[2];

	// print("mid point", newPoint[point_offset+0], newPoint[point_offset+1], newPoint[point_offset+2]);
	//print("out scale", scale[0], scale[1], scale[2]);

	newPoint[point_offset+0] = newPoint[point_offset+0] * scale[0];
	newPoint[point_offset+1] = newPoint[point_offset+1] * scale[1];
	newPoint[point_offset+2] = newPoint[point_offset+2] * scale[2];

	print("out point", newPoint[point_offset+0], newPoint[point_offset+1], newPoint[point_offset+2]);
	return Java.to(newPoint, Java.type("double[]"));
}
function transformNode(node, parentTranslation, scale, parentNode) {
	if (node == null) {
		return false;
	}
	var storedTranslation = [parentTranslation[0], parentTranslation[1], parentTranslation[2]];
	var children = null;
	var clzind = node.getClass().getName().lastIndexOf(".");
	var clz = node.getClass().getName().substring(clzind+1);
	if (clz == "HAnimHumanoid") {
		print("clz is "+clz);
		var coordinate = node.getSkinCoord();
		var skeleton = node.getSkeleton();
		if (coordinate == null) {
			children = node.getSkinList();
		} else if (coordinate.getUSE()) {
			children = node.getSkinList();
		} else {
			children = [coordinate];
		}
		// TODO worry about length
		children = [...skeleton, ...children];
		print("humanoid children "+JSON.stringify(children));
	} else if (clz == "Scene") {
		print("clz is "+clz);
		children = node.getChildren();
	} else if (clz == "HAnimJoint") {
		var joint = node;

		var translation = joint.getTranslation();
		storedTranslation[0] += translation[0];
		storedTranslation[1] += translation[1];
		storedTranslation[2] += translation[2];
		// print("is a joint", storedTranslation);

		var center = joint.getCenter();
		center = transformPoint(center, 0, storedTranslation, scale);
		joint.setCenter(center);
		joint.setTranslation(Java.to([0, 0, 0], Java.type("double[]")));

		children = joint.getChildrenList();
		// print("children are "+children.size());
	} else if (clz == "HAnimSite") {
		var site = node;

		var translation = site.getTranslation();
		storedTranslation[0] += translation[0];
		storedTranslation[1] += translation[1];
		storedTranslation[2] += translation[2];

		var center = site.getCenter();
		center = transformPoint(center, 0, storedTranslation, scale);
		site.setCenter(center);
		site.setTranslation(Java.to([0, 0, 0], Java.type("double[]")));

		children = site.getChildrenList();
	} else if (clz == "HAnimSegment") {
		var segment = node;
		var coord = segment.getCoord();
		if (coord !== null) {
			if (!transformNode(coord, storedTranslation, scale, node)) {
				// print("Unpacking coord in transformNode() HAnimSegment failed");
			}
		}
		var displacers = segment.getDisplacersList();
		if (displacers !== null) {
			for (var displacer in displacers) {
				if (!transformNode(displacers[displacer], storedTranslation, scale, node)) {
					// print("Unpacking displacer in HAnimSegment failed");
				}
			}
		}
		children = segment.getChildrenList();
	} else if (clz == "Group") {
		var group = node;
		children = group.getChildrenList();
	} else if (clz == "Transform") {
		var transform = node;
		var translation = transform.getTranslation();
		storedTranslation[0] += translation[0];
		storedTranslation[1] += translation[1];
		storedTranslation[2] += translation[2];

		try {
			if (transform.getDEF() || transform.getName()) {  // add more defaults, so we won't delete the node, if there's more than children data
				// print("Zeroing transform", transform.getDEF(), transform.getName());
				// transform.setTranslation(Java.to([0, 0, 0], Java.type("double[]")));  // Transform should be abandoned, but result leads to NO-OP
				children = transform.getChildrenList();
			} else {
				// print("Moving ALL nodes below ", parentNode, parentNode.getDEF(), parentNode.getName(), ", not just the singleton Transform");
				let transformArray = transform.getChildren(); 
				let parentArray = transformArray.clone();
				// TODO delete the ONE transform, not the whole parentNode array
				parentNode.setChildren(parentArray);
				children = parentNode.getChildrenList();
				// transform.setChildrenList(null);
			}
		} catch (e) {
			print("error ", e);
		}


	} else if (clz == "Shape") {
		var shape = node;
		var appearance = shape.getAppearance();
		if (!transformNode(appearance, storedTranslation, scale, node)) {
			// print("Unpacking appearance in Shape failed");
		}
		var geometry = shape.getGeometry();
		if (geometry && transformNode(geometry, storedTranslation, scale, node)) {
			print("Unpacking geometry in Shape succeeded");
		} else {
			print("Unpacking geometry in Shape failed");
		}
	} else if (clz == "IndexedFaceSet") {
		print("clz is "+clz);
		var ifs = node;
		print(ifs.toStringX3D(1));
		var coord = ifs.getCoord();
		children = [coord];
	} else if (clz == "Coordinate") {
		print("clz is "+clz);
		var coordinate = node;
		var point = coordinate.getPoint();
		// print("point input "+JSON.stringify(point));
		for (var p = 0; p < point.length; p += 3) {
			point = transformPoint(point, p, storedTranslation, scale);
		}
		coordinate.setPoint(point);
		// print("point output "+JSON.stringify(point));
	} else if (clz == "Appearance") {
	} else if (clz == "ROUTE") {
	} else if (clz == "CommentsBlock") {
	} else if (node !== null) {
		print("Unhandled node is "+node);
	} else {
		// print("Node is "+node);
		return false;
	}
	if (children !== null) {
		for (var child in children) {
			var copyTranslation = [storedTranslation[0], storedTranslation[1], storedTranslation[2]];
			if (children[child] !== null && transformNode(children[child], copyTranslation, scale, node)) {
				// print("parent is "+clz+" Child "+child);
			} else {
				print("Unpacking child "+children[child]+" failed");
			}
		}
	}
	return true;
}
