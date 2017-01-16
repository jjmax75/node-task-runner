'use strict';

require( 'dotenv' ).config(); // environment variables
const fork = require('child_process').fork;

// db connection
const MongoClient = require( 'mongodb' ).MongoClient;
const dbUrl = process.env.DBURL;
let db; // store the database connection
MongoClient.connect( dbUrl, ( err, database ) => {
  if ( err ) error( err );
  db = database;
  console.log( 'connected to db successfully' );

  db.collection( 'videos' ).find( {} ).toArray( (err, videos) => {

    let count = 0;
    let child;

    function loopVideos() {

      if ( count < videos.length ) {
        console.log( 'sending video:', videos[ count ].video_id );
        const child = fork(process.env.CHILDAPP, [ videos[ count ].video_id ], {
          stdio: 'pipe'
        });

        child.on( 'close', ( code ) => {
          console.log( 'child exited with code:', code );
          count++;
          loopVideos();
        });
      } else {
        process.exit( code )
      }
    }

    loopVideos();
  });
});
