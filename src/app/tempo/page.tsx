
import { headers } from 'next/headers'
export const dynamic = 'force-dynamic';

export default async function Page() {
    // const headersList = await headers();
    const authorization = (await headers()).get('Authorization');
    const useragent = (await headers()).get('user-agent');
    const connection = ((await headers()).get('connection'));
    const accept = (await headers()).get('accept');
    const acceptLanguage = (await headers()).get('accept-language');
    const acceptEncoding = (await headers()).get('accept-encoding');
    const host = (await headers()).get('host');
    const referer = (await headers()).get('referer');

    return (
        <>
            <div className='flex flex-col gap-1'>
                <h1> HEADERS LIST </h1>
                <h1>Authorization {authorization}</h1>
                <h1>User Agent : {useragent}</h1>
                <h1>Connection: {connection}</h1>
                <h1>Accept : {accept}</h1>
                <h1>Accept Language : {acceptLanguage}</h1>
                <h1>Host: {host}</h1>
                <h1>Accept Language : {acceptLanguage}</h1>
                <h1>Accept Encoding: {acceptEncoding}</h1>
                <h1>Referer: {referer}</h1>
            </div>
        </>
    )
}