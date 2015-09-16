var mp = .3,
		mr = .5,
		ms = .01;

var mesh;
var loader = new THREE.STLLoader();
var material;

var Menu = function() {
	this.STL_file = './models/wrench.stl',
	this.position = mp;
	this.rotation = mr;
	this.scale = ms;
};

if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats;
var camera, cameraTarget, scene, renderer;

var mouseX = 0, mouseY = 0;
var faceX = 0, faceY = 0;
var objX = 0, objY = 0;

var video = document.getElementById('video');
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var context2 = canvas.getContext('2d');

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

init();
animate();

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 15 );
	camera.position.set( 3, 0.15, 3 );

	cameraTarget = new THREE.Vector3( 0, -0.25, 0 );

	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x72645b, 2, 15 );

  var PI2 = Math.PI * 2;
  var program = function (context) {
    context.beginPath();
    context.arc(0, 0, 0.5, 0, PI2, true);
    context.fill();
	}

	var program2 = function (context) {
    context.beginPath();
    context.arc(0, 0, 0.5, 0, PI2, true);
    context.fill();
	}

	// Ground

	var plane = new THREE.Mesh(
		new THREE.PlaneBufferGeometry( 40, 40 ),
		new THREE.MeshPhongMaterial( { color: 0x999999, specular: 0x101010 } )
	);
	plane.rotation.x = -Math.PI/2;
	plane.position.y = -0.5;
	scene.add( plane );

	plane.receiveShadow = true;

	// load STL
	//var loader = new THREE.STLLoader();
	material = new THREE.MeshPhongMaterial( { color: 0xAAAAAA, specular: 0x111111, shininess: 200 } );

	loader.load( './models/wrench.stl', function ( geometry ) {

		var meshMaterial = material;
		if (geometry.hasColors) {
			meshMaterial = new THREE.MeshPhongMaterial({ opacity: geometry.alpha, vertexColors: THREE.VertexColors });
		}

		mesh = new THREE.Mesh( geometry, meshMaterial );
		//mesh.position.set( .3, .3, 0 );
		//mesh.rotation.set(  Math.PI / 2, Math.PI, Math.PI / 2 );
		//mesh.scale.set( 0.01, 0.01, 0.01 );

		mesh.position.set( mp, mp, 0 );
		mesh.rotation.set(  Math.PI * mr, 2 * Math.PI * mr, Math.PI * mr );
		mesh.scale.set( ms, ms, ms );

		mesh.castShadow = true;
		mesh.receiveShadow = true;

		scene.add( mesh );

	} );


	// Lights

	scene.add( new THREE.AmbientLight( 0x777777 ) );

	addShadowedLight( 1, 1, 1, 0xffffff, 1.35 );
	addShadowedLight( 0.5, 1, -1, 0xffaa00, 1 );

	// renderer

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setClearColor( scene.fog.color );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );

	renderer.gammaInput = true;
	renderer.gammaOutput = true;

	renderer.shadowMapEnabled = true;
	renderer.shadowMapCullFace = THREE.CullFaceBack;

	container.appendChild( renderer.domElement );

	// stats

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	container.appendChild( stats.domElement );

	//

	window.addEventListener( 'resize', onWindowResize, false );

}

function addShadowedLight( x, y, z, color, intensity ) {

	var directionalLight = new THREE.DirectionalLight( color, intensity );
	directionalLight.position.set( x, y, z );
	scene.add( directionalLight );

	directionalLight.castShadow = true;
	// directionalLight.shadowCameraVisible = true;

	var d = 1;
	directionalLight.shadowCameraLeft = -d;
	directionalLight.shadowCameraRight = d;
	directionalLight.shadowCameraTop = d;
	directionalLight.shadowCameraBottom = -d;

	directionalLight.shadowCameraNear = 1;
	directionalLight.shadowCameraFar = 4;

	directionalLight.shadowMapWidth = 1024;
	directionalLight.shadowMapHeight = 1024;

	directionalLight.shadowBias = -0.005;
	directionalLight.shadowDarkness = 0.15;

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );

}

window.onload = function() {
	/* CAD MENU STUFF*/
	var panel = new Menu();
	var gui = new dat.GUI();

	var file = gui.add(panel, 'STL_file');

	var positionF = gui.add(panel, 'position', 0, 1); // Min and max
	var rotationF = gui.add(panel, 'rotation', 0, 2); // Min and max
	var scaleF = gui.add(panel, 'scale', 0, 1); // Min and max

	positionF.onChange(function(value){
		mesh.position.set( value, value, 0 );
		mp = value;
	});

	rotationF.onChange(function(value){
		mesh.rotation.set(  Math.PI * value, Math.PI *2* value, Math.PI * value );
		mr = value;
	});

	scaleF.onChange(function(value){
		mesh.scale.set( value, value, value );
		ms = value;
	});

	file.onFinishChange(function(value){

		console.log('new STL: ' + value);
		scene.remove(mesh);
		console.log('old STL mesh removed');

		loader.load( value, function ( geometry ) {

			var meshMaterial = material;
			if (geometry.hasColors) {
				meshMaterial = new THREE.MeshPhongMaterial({ opacity: geometry.alpha, vertexColors: THREE.VertexColors });
			}
			mesh = new THREE.Mesh( geometry, meshMaterial );
			mesh.position.set( mp, mp, 0 );
			mesh.rotation.set(  Math.PI * mr, 2 * Math.PI * mr, Math.PI * mr );
			mesh.scale.set( ms, ms, ms );
			mesh.castShadow = true;
			mesh.receiveShadow = true;
			scene.add( mesh );
		} );

		console.log('new STL loaded');

	});

	/* END CAD MENU STUFF*/

  var trackerC = new tracking.ColorTracker();
  trackerC.setMinDimension(5);
  trackerC.setMinGroupSize(10);
  tracking.track('#video', trackerC, { camera: true });
  trackerC.on('track', onColorMove);

	/*var trackerF = new tracking.ObjectTracker('face');
  trackerF.setInitialScale(4);
  trackerF.setStepSize(2);
  tracking.track('#video', trackerF, { camera: true });
	trackerF.on('track', onFaceMove);*/
};

function onColorMove(event) {
  if (event.data.length === 0) {
    return;
  }
  var maxRect;
  var maxRectArea = 0;
  event.data.forEach(function(rect) {
    if (rect.width * rect.height > maxRectArea){
      maxRectArea = rect.width * rect.height;
      maxRect = rect;
    }
  });
  if (maxRectArea > 0) {
    var rectCenterX = maxRect.x + (maxRect.width/2);
    var rectCenterY = maxRect.y + (maxRect.height/2);
    objX = (rectCenterX - 160) * (window.innerWidth/320) * 10;
    objY = (rectCenterY - 120) * (window.innerHeight/240) * 10;
    context2.clearRect(0, 0, canvas.width, canvas.height);
    context2.strokeStyle = maxRect.color;
    context2.strokeRect(maxRect.x, maxRect.y, maxRect.width, maxRect.height);

    context2.font = '11px Helvetica';
    context2.fillStyle = "#fff";
    context2.fillText('x: ' + maxRect.x + 'px', maxRect.x + maxRect.width + 5, maxRect.y + 11);
    context2.fillText('y: ' + maxRect.y + 'px', maxRect.x + maxRect.width + 5, maxRect.y + 22);
  }
}

function onFaceMove(event) {
  if (event.data.length === 0) {
    return;
  }
  var maxRect;
  var maxRectArea = 0;
  event.data.forEach(function(rect) {
    if (rect.width * rect.height > maxRectArea){
      maxRectArea = rect.width * rect.height;
      maxRect = rect;
    }
  });
  if (maxRectArea > 0) {
    var rectCenterX = maxRect.x + (maxRect.width/2);
    var rectCenterY = maxRect.y + (maxRect.height/2);
    mouseX = (rectCenterX - 160) * (window.innerWidth/320) * 10;
    mouseY = (rectCenterY - 120) * (window.innerHeight/240) * 10;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = maxRect.color;
    context.strokeRect(maxRect.x, maxRect.y, maxRect.width, maxRect.height);

    context.font = '11px Helvetica';
    context.fillStyle = "#fff";
    context.fillText('x: ' + maxRect.x + 'px', maxRect.x + maxRect.width + 5, maxRect.y + 11);
    context.fillText('y: ' + maxRect.y + 'px', maxRect.x + maxRect.width + 5, maxRect.y + 22);
  }
}

function animate() {

	requestAnimationFrame( animate );
	render();
	stats.update();

}

function render() {
	var timer = Date.now() * 0.0005;

	// change scene position based on head tracking (right now color tracking)

	var m2 = scene.children[6];
	/*m2.rotation.set(
		(mouseX - camera.position.x)* Math.PI,
		Math.PI,
		(- mouseY - camera.position.y) * Math.PI
	);*/


	//camera.position.x = (mouseX - camera.position.x) * 0.001;
  //camera.position.y = (- mouseY - camera.position.y) * 0.001;


	camera.position.x = (objX - camera.position.x) * 0.001;
  camera.position.y = (- objY - camera.position.y) * 0.001;

	camera.lookAt(scene.position);
  renderer.render(scene, camera);

}

/* FACE TRACKING*/
/*var tracker = new tracking.ObjectTracker('face');
tracker.setInitialScale(4);
tracker.setStepSize(2);
tracking.track('#video', tracker, { camera: true });

tracker.on('track', function(event) {
  var maxRectArea = 0;
  var maxRect;
  event.data.forEach(function(rect) {
    if (rect.width * rect.height > maxRectArea){
      maxRectArea = rect.width * rect.height;
      maxRect = rect;
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = 'magenta';
    context.strokeRect(rect.x, rect.y, rect.width, rect.height);
    context.font = '11px Helvetica';
    context.fillStyle = "#fff";
    context.fillText('x: ' + rect.x + 'px', rect.x + rect.width + 5, rect.y + 11);
    context.fillText('y: ' + rect.y + 'px', rect.x + rect.width + 5, rect.y + 22);
  });
  if(maxRectArea > 0) {
    var rectCenterX = maxRect.x + (maxRect.width/2);
    var rectCenterY = maxRect.y + (maxRect.height/2);
    faceX = (rectCenterX - 160) * (window.innerWidth/320) * 50;
    faceY = (rectCenterY - 120) * (window.innerHeight/240) * 50;
  }
  fishTankRenderer.render(faceX, faceY);
});*/
