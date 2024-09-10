import Client from "@/components/client"

export default function ClientPage() {
    const SERVER_ID = 'hcd-test'
    return (
        <Client serverId={SERVER_ID} />
    )
}
