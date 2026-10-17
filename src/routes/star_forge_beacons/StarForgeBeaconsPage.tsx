import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ReactMarkdown from "react-markdown";
import { get_star_forge_beacons, type IStarForgeBeacon } from "../../lib/api/star_forge_beacons";
import { get_time_elapsed_since } from "../../lib/utils";
import PageFormatting from "../../components/PageFormatting";
import LinkComponent from "./LinkComponent";

export default function StarForgeBeaconsPage() {
    const [beacons, setBeacons] = useState<IStarForgeBeacon[]>([]);

    useEffect(() => {
        get_star_forge_beacons().then((response) => {
            if (response.is_err()) {
                toast.error(response.unwrap_err());
                return;
            }
            setBeacons(response.unwrap());
        });
    }, []);

    function get_parsed_date(time: string): string {
        return get_time_elapsed_since(new Date(time));
    }

    return (
        <PageFormatting title="Star Forge Beacons">
            <div className="flex flex-col gap-4">
                {beacons.map((beacon, idx) => (
                    <div key={idx} className="panel p-3">
                        <div className="flex flex-row gap-1">
                            {beacon.avatar_url != undefined && (
                                <img src={beacon.avatar_url} className="w-12 h-12 rounded-full" alt="avatar" />
                            )}
                            {beacon.global_name != undefined ? (
                                <>
                                    <div>{beacon.global_name}</div>
                                    <div>({beacon.name})</div>
                                </>
                            ) : (
                                <div>{beacon.name}</div>
                            )}
                            <div><b>{get_parsed_date(beacon.create_time)}</b></div>
                        </div>
                        <ReactMarkdown
                            components={{
                                a: ({ href, title, children }) => (
                                    <LinkComponent href={href} title={title}>{children}</LinkComponent>
                                ),
                            }}
                        >
                            {beacon.message}
                        </ReactMarkdown>
                        <div className="flex flex-col gap-1">
                            {beacon.attachments.map((attachment, i) => (
                                <img key={i} src={attachment} alt="attachment" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </PageFormatting>
    );
}
