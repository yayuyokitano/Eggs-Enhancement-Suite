import "./playlistcover.scss";
import icon from "../../icons/icon128.png";

export function PlaylistCover(props: {imageURLs:string[]|undefined, columnCount:number, rowCount:number, width:number, height:number}) {
  const { columnCount, rowCount, width, height} = props;

  const imageURLs = props.imageURLs?.filter((url) => url) ?? [];

  return (
    <div
      className="ees-playlist-cover"style={{
        height: `${height}px`,
        width: `${width}px`,
        backgroundImage: `url(${icon})`,
      }}
    >
      {imageURLs.slice(0, rowCount * columnCount).map((imageURL) => {
        return <img
          key={imageURL}
          src={imageURL}
          alt=""
          width={`${width/columnCount}px`}
          height={`${height/rowCount}px`}
          className="ees-playlist-cover-image"
        />
      })}
    </div>
  )
}