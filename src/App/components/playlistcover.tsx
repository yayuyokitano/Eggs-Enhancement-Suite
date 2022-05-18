import "./playlistcover.scss";

export function PlaylistCover(props: {imageURLs:string[]|undefined, columnCount:number, rowCount:number, width:number, height:number}) {
  const {imageURLs, columnCount, rowCount, width, height} = props;

  if (!imageURLs) return <div
    className="ees-playlist-cover"
    style={{
      height: `${height}px`,
      width: `${width}px`,
    }}
  />;

  return (
    <div
      className="ees-playlist-cover"
      style={{
        height: `${height}px`,
        width: `${width}px`,
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