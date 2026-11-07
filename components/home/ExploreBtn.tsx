'use client';
import Image from 'next/image';
const ExploreBtn = () => {
    return (
        <a className="explore-btn mt-7 mx-auto" href="#events">
            Explore Events
            <Image src="/icons/arrow-down.svg" alt="arrow-down" width={24} height={24} />
        </a>
    )
}
export default ExploreBtn
