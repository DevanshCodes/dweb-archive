import React from 'react';
import IAReactComponent from './IAReactComponent';
import {gateway, gatewayServer} from "@internetarchive/dweb-archivecontroller/Util";
import {AudioTheatre, BookReaderTheatre, CarouselTheatre, ImageTheatre, MessageTheatre, VideoTheatre} from "./Theatres";

/**
 * A set of components that make up the Details Page
 * TODO - migrating stuff here from Details.js
 *
 * <DetailsIAWrap
 *  identifier, mediatype, name, title, creator     Fields form Metadata API
 *  item=ARCHIVEITEM  // Currently Needed if its a bookreader,
 *  poster=URL    // Poster for videos, mostly for search engines
 *  playlist={...} // As stored in item from playlist API
 *  files=
 *  page=
 * />
 */
class DetailsIAWrap extends IAReactComponent {
  render() {
      // This is a combo wrap that handles multiple mediatypes

      if (this.props.subtype === "carousel") { //TODO merge with other archive_setup_push
        archive_setup.push(function () {
          AJS.theatresize();
          AJS.carouselsize('#ia-carousel', true);
        });
      }
      //TODO video at moment only plays first in playlist which is usually, but not always correct - need an example of multi-video item
      return (

        /*React doesnt like this - says resized isnt boolean// resized={["image"].includes(this.props.mediatype)} */
        <div id="theatre-ia-wrap" className="container container-ia width-max"
             style={["image"].includes(this.props.mediatype) ? {height: "600px"} : undefined} >
          <link itemProp="url" href={`https://archive.org/details/${this.props.identifier}`}/> {/*Probably correct as archive.org/details since itemProp*/}
          {/* - TODO unclear why image & text|audio mediatypes use different itemprop below check current archive.org pages*/}
          <link itemProp={["image","movies"].includes(this.props.mediatype) ? "thumbnailUrl" : "image"}
                href="https://archive.org/services/img/{this.props.identifier}"/>{/*OK for direct link since itemprop*/}

          { (this.props.playlist && ["audio","etree"].includes(this.props.mediatype)) // isDark wont have a playlist
            ?
            this.props.playlist.map((track,i) => ( // OK to be absolute or dweb link
              <div key={i} itemprop="hasPart" itemscope itemtype="http://schema.org/AudioObject">
                <meta itemprop="name" content={track.title}/>
                <meta itemprop="duration" content={`PT0M${parseInt(track.duration)}S`}/>
                {   // Loop over the sources which can be multiple files for the same track.  Note this is limited to playable sources, could add unplayable to playlist if want as separate field e.g. unplayablesources
                  track.sources.map((f,i) => (
                    <link key={i} itemprop="associatedMedia" href={`https://archive.org/download/${this.props.identifier}/${f.name}`}/>
                  ))
                }
              </div>
            ))
            :
            this.props.files.filter((af)=> af.metadata.source !== "metadata")
              .map((af) => ( //OK for direct link since itemprop
                <link itemProp="associatedMedia" href={`https://archive.org/download/${this.props.identifier}/${af.metadata.name}`} key={`${this.props.identifier}/${af.metadata.name}`}/>
              ))
          }
          { !["movies"].includes(this.props.mediatype) ? null :
            <>
              <link itemProp="contentUrl" href={`${gatewayServer()}${gateway.urlDownload}/${this.props.identifier}/${this.props.playlist[0].sources[0].name}`}/>
              <link itemProp="embedUrl" href={`${gatewayServer()}${gateway.urlDownload}/${this.props.identifier}/${this.props.playlist[0].orig}`}/>
              <meta itemProp="duration" content={`PT0M${parseInt(this.props.playlist[0].duration)}S`}/>
            </>
          }


          <h1 className="sr-only">{this.props.title}</h1>
          <h2 className="sr-only">{this.props.mediatype} preview</h2>
          { (["texts"].includes(this.props.mediatype) && (this.props.subtype === "carousel") )
            ?
            <CarouselTheatre
              identifier={this.props.identifier}
              slides={this.props.files4carousel().map(f => ({filename: f.metadata.name, source: f}))}
              creator={this.props.creator}
              mediatype={this.props.mediatype}
              title={this.props.title}
            />
            : (["texts"].includes(this.props.mediatype) && (this.props.subtype === "bookreader"))
            ? <BookReaderTheatre
              identifier={this.props.identifier}
              item={this.props.item}
              creator={this.props.creator}
              mediatype={this.props.mediatype}
              title={this.props.title}
              page={this.props.page}
            />
            : (["image"].includes(this.props.mediatype) && this.props.source)
            ?
            <ImageTheatre
              alt="item image #1"
              source={this.props.source}
              caption={this.props.source.metadata.name}
              identifier={this.props.identifier}
              mediatype={this.props.mediatype}
              creator={this.props.creator}
              title={this.props.title}/>
            : (["audio","etree"].includes(this.props.mediatype))
            ?
            <AudioTheatre
              identifier={this.props.identifier}
              mediatype={this.props.mediatype} creator={this.props.creator} title={this.props.title}
              imgsrc={this.props.poster}
              playlist={this.props.playlist}
              initialPlay={1}
            />
            : (["movies"].includes(this.props.mediatype))
            ? /* The 'poster' is intentionally a direct Http link as its intended only for search engines etc
                Preference is 2nd thumbnail (first is usually black-sreen) in .thumbs/ directory (e.g. for "commute");
                if only one (e.g. item 'stairs') use that. */
            <VideoTheatre identifier={this.props.identifier} mediatype={this.props.mediatype} poster={this.props.poster}
                          title={this.props.title} creator={this.props.creator} source={this.props.playlist[0].sources[0].urls} />
            :
            <MessageTheatre title="There Is No Preview Available For This Item">
              <p>
                This item does not appear to have any files that can be experienced on Archive.org
                <br/><span className="hidden-xs hidden-sm">Please download files in this item to interact with them on your computer.</span><br/>
                {/* Should be link to DownloadDirectory */}
                <a className="show-all" href={`https://archive.org/download/${this.props.identifier}`} target="_blank">Show all files</a>
              </p>
            </MessageTheatre>
          }
          <div id="flag-overlay" className="center-area"> </div>
        </div>
  ); }
}
export { DetailsIAWrap }