import * as THREE from '../libs/three.module.js';
import { GUI } from '../libs/lil-gui.esm.min.js';
import { CSS2DRenderer, CSS2DObject } from '../libs/CSS2DRenderer.js';

// Global variables
let camera_zoom = 10;
let resolution_x = 16;
let resolution_y = 9;
let pause_time = false;

const fragCoord = [];
const timer = new THREE.Clock(true);

// Getting started
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
//const frustumSize = 10;
//let aspect = window.innerWidth / window.innerHeight;
//let camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize( window.innerWidth, window.innerHeight );
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
document.body.appendChild( labelRenderer.domElement );

// initiate
function init() {
    // FragCoord, indexes every pixel by a vector2.
    for ( let y = 0; y < resolution_y; y++ ) {
        for ( let x = 0; x < resolution_x; x++ ) {
            let pixel_coord = new THREE.Vector2( x, y );
            fragCoord.push( pixel_coord );
        }
    }

    // < create a grid, each cell representing a pixel >
    const screen = new THREE.Group(); // This will be parent of all screen_pixel objects.
    const geometry = new THREE.PlaneGeometry(1, 1);
    let count = 0;
    for ( let y = 0; y < resolution_y; y++ ) {
        for ( let x = 0; x < resolution_x; x++ ) {

            const material = new THREE.MeshBasicMaterial( { color: 0xffffff} );

            const screen_pixel = new THREE.Mesh( geometry, material );

            // Label for each pixel
            const pixelDiv = document.createElement( 'div' );
            pixelDiv.className = 'label';
            pixelDiv.textContent = String( fragCoord[ count ].x ) + "," + String( fragCoord[ count ].y );
            const pixelLabel = new CSS2DObject( pixelDiv );
            pixelLabel.position.set( 0, 0, 0 );
            pixelLabel.layers.set( 0 );

            screen_pixel.add( pixelLabel )

            screen.add( screen_pixel );

            screen_pixel.material.color.setRGB(1,0,0);

            screen_pixel.position.x = x;
            screen_pixel.position.y = y;
            screen_pixel.position.z = 0;
            screen_pixel.scale.set( 0.8, 0.8, 1 );

            count++;
        }
    }

    scene.position.x -= resolution_x/2 - 0.5;
    scene.position.y -= resolution_y/2 - 0.5;

    scene.add( screen );

    camera.position.z = camera_zoom;
}

// GUI controller
const gui = new GUI();

const Controller = {
    Camera_Zoom: camera_zoom,
    Pause_Time: pause_time
};

const valuesChanger = function () {
    camera_zoom = Controller.Camera_Zoom;
    camera.position.z = camera_zoom;
    
    if (pause_time) {
        timer.start();
    } else {
        timer.stop();
    }

    pause_time = Controller.Pause_Time;


}

gui.add( Controller, 'Camera_Zoom', 3, 18, 1 ).onChange( valuesChanger );
gui.add( Controller, 'Pause_Time' ).onChange( valuesChanger );

window.addEventListener( 'resize', onWindowResize );
function onWindowResize() {
    //aspect = window.innerWidth / window.innerHeight;
    camera.aspect = window.innerWidth / window.innerHeight;
    /*camera.left = - frustumSize * aspect / 2;
    camera.right = frustumSize * aspect / 2;
    camera.top = frustumSize / 2;
    camera.bottom = - frustumSize / 2; */

    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    labelRenderer.setSize( window.innerWidth, window.innerHeight );
}

// fragCoord is THREE.Vector2
function fragment_shader( fragCoord ) {
    for ( let y = 0; y < resolution_y; y++ ) {
        for ( let x = 0; x < resolution_x; x++ ) {
            const fragColor = new THREE.Vector3;
            const i = y * resolution_x + x; // index_of_pixel
            const time = timer.getElapsedTime() // time since the beginning

/////***/////////////////////////////////////////////////////////////////////////////***/////
/////***/////////////////////////////////////////////////////////////////////////////***/////
            /////***/////  WRITE YOUR SHADER CODE HERE  /////***/////


            const uv = new THREE.Vector2( fragCoord[i].x / resolution_x, fragCoord[i].y / resolution_y );

            fragColor.set( 0.5 + 0.5*Math.cos( time + uv.x + 0), 0.5 + 0.5*Math.cos( time + uv.y + 2 ), 0.5 + 0.5*Math.cos( time + uv.x + 3 ) )
            
            
            /////***/////  WRITE YOUR SHADER CODE HERE  /////***/////
/////***/////////////////////////////////////////////////////////////////////////////***/////
/////***/////////////////////////////////////////////////////////////////////////////***/////

            // ( scene's children[0] = screen ) -> ( screen.children[0] = screen_pixel[0~143] ) -> ( screen_pixel.children[0] = CSS2DObject )
            scene.children[0].children[ i ].material.color.setRGB( fragColor.x, fragColor.y, fragColor.z );

            // < Update CSS2DObject Text >
            const pixelDiv = document.createElement( 'div' );
            pixelDiv.className = 'label';
            
            // This would be the accurate numbers, but, 
            /* pixelDiv.textContent =
             String( Math.round( fragColor.x * 10 ) / 10 ) + "," 
             + String( Math.round( fragColor.y * 10 ) / 10 ) + "," 
             + String( Math.round( fragColor.z * 10 ) / 10 ); */

            // Given the tight space, this is more ideal. Numbers moving from 0 to 9.
            pixelDiv.textContent =
             String( Math.round( fragColor.x * 9 ) ) + "," 
             + String( Math.round( fragColor.y * 9 ) ) + "," 
             + String( Math.round( fragColor.z * 9 ) );

            const pixelLabel = new CSS2DObject( pixelDiv );
            scene.children[0].children[ i ].remove(scene.children[0].children[ i ].children[0]);
            scene.children[0].children[ i ].add(pixelLabel);
        }
    }
    // Normalized pixel coordinates (from 0 to 1)
}

// game loop
function animate() {
    requestAnimationFrame( animate );

    if ( pause_time == false ) {
        fragment_shader( fragCoord );
    }

    renderer.render( scene, camera );
    labelRenderer.render( scene, camera );
};

init();
animate();
