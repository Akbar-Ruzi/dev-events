const EventTags = ({tags}: {tags: string[] }) => (
    <div className="flex flex-row gap-1.5 flex-wrap">
        {tags.map((tag:string,index:number) =>(
            <div key={`${tag}-${index}`} className="pill">{tag}</div>
        ))}
    </div>
)

export default EventTags;