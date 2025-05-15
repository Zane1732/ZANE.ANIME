  "use client";
import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useMemo } from "react";
// important libraries imports
import { useQuery } from "@tanstack/react-query";
// constants import
import { QUERY_KEY } from "@/lib/query-key";
// store imports
import { useHistory } from "@/store/history";
import { usePlayerStore } from "@/store/player-store";
import { useServer } from "@/store/server";
// components imports
import Episodes from "@/app/(main)/watch/_components/episodes";
import AniFirePlayer from "@/app/(main)/watch/_components/player/anifire-player";
// shared components
import AnimeCard from "@/components/shared/anime-card";
import HoveredContent from "@/components/shared/hovered-content";
import BeatLoader from "@/components/shared/loader";
import OtherInfos from "@/components/shared/other-infos";
// UI Components
import { Badge } from "@/components/ui/badge";
import { CustomImage } from "@/components/ui/image";
import Description from "@/components/ui/info/description";
import Separator from "@/components/ui/separator";
// utils function
import { cn } from "@/lib/utils";
import { useQueryState } from "nuqs";
import HomeLayout from "@/components/shared/layouts/home-layout";
import {
  getAnimeEpisodesById,
  getAnimeEpisodeServers,
  getAnimeInfoById,
  getAnimeStreamingLinksByEpisodeId,
} from "@/services/api";
import PlayerControls from "../_components/player/player-controls";
import SelectServers from "../_components/select-servers";
export default function Page({
  params,
}: {
  params: Promise<{ episodeId: string }>;
}) {
  const { episodeId } = use(params);
  const [ep] = useQueryState("ep");
  // to create an full url /animeId?ep=episode_id
  const encodedEpisodesId = useMemo(
    () => episodeId + `?ep=${ep}`,
    [ep, episodeId],
  );
  const { light } = usePlayerStore();
  const { currentServer, setCurrentServer, category, setCategory } =
    useServer();
  const { setHistory, allAnimeWatched } = useHistory();
  const { data: servers } = useQuery({
    queryKey: ["ANIME_EPISODE_SERVERS", encodedEpisodesId],
    queryFn: () => getAnimeEpisodeServers(encodedEpisodesId),
  });
  const { data: animeInfo, isLoading: isInfoLoading } = useQuery({
    queryKey: [QUERY_KEY.ANIME_INFO, episodeId],
    queryFn: () => getAnimeInfoById(episodeId),
  });
  const { data: episodes, isLoading: isEpisodesLoading } = useQuery({
    queryKey: [QUERY_KEY.ANIME_EPISODES_BY_ID, episodeId],
    queryFn: () => getAnimeEpisodesById(episodeId),
    enabled: !!episodeId,
  });
  useEffect(() => {
    if (!servers) return;
    const server =
      servers.sub.length > 0
        ? servers.sub[0].serverName
        : servers.raw[0].serverName;
    setCurrentServer(server);
    setCurrentServer(servers.sub.length > 0 ? "hd-2" : server);
  }, [servers]);

  useEffect(() => {
@@ -213,6 +213,7 @@ export default function Page({
            ) : (
              <AniFirePlayer
                episodeId={encodedEpisodesId}
                poster={animeInfo?.anime.info.poster as string}
                episodes={episodes}
                {...data}
              />
            )}
            <PlayerControls
              episodeId={encodedEpisodesId}
              episodes={episodes!}
            />
            {servers && <SelectServers {...servers} />}
          </div>
          <div className="max-h-[590px] w-full shrink-0 px-4 xl:px-0 3xl:basis-[22%]">
            {isInfoLoading ? (
              <div className="grid h-full w-full place-items-center">
                <BeatLoader childClassName="h-3 w-3" />
              </div>
            ) : (
              <div className="flex flex-col gap-4 py-4 xl:pl-6 xl:pr-4">
                <div className="relative aspect-anime-image h-44 w-32 shrink-0 shadow">
                  <Image
                    draggable={false}
                    src={animeInfo?.anime.info.poster!}
                    alt={animeInfo?.anime.info.name!}
                    fill
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="text-2xl font-semibold">
                  {animeInfo?.anime.info.name}
                </h3>
                <div className="">
                  <OtherInfos {...animeInfo?.anime.info.stats!} />
                </div>
                <div className="max-h-60 w-full overflow-y-scroll">
                  <Description
                    description={animeInfo?.anime.info.description ?? ""}
                    className="text-[13px] !leading-tight text-white/80"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="wrapper-container flex flex-col gap-9 px-4 xl:flex-row">
        <div className="w-full py-10 xl:basis-[75%]">
          <HomeLayout heading="Recommended for you">
            <div className="mt-6 grid grid-cols-2 gap-4 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {animeInfo?.recommendedAnimes.map((anime) => (
                <AnimeCard key={anime.id} {...anime} />
              ))}
            </div>
          </HomeLayout>
        </div>
        <div className="space-y-6 py-10 xl:basis-[25%]">
          <h4 className="text-2xl font-medium text-secondary">Related Anime</h4>
          <div className="space-y-4 bg-primary-100 px-4 py-6">
            {animeInfo?.relatedAnimes.slice(0, 6).map((anime) => (
              <div
                key={anime.id}
                className="flex w-full items-center gap-x-4 border-b border-white/10 pb-4 last:border-0"
              >
                <HoveredContent animeId={anime.id}>
                  <div className="relative h-[4.8rem] w-14 shrink-0">
                    <CustomImage
                      src={anime.poster}
                      alt={anime.name}
                      loading="lazy"
                      fill
                      className="overflow-hidden rounded-md object-cover"
                    />
                  </div>
                </HoveredContent>
                <div className="flex flex-col justify-center space-y-1.5">
                  <Link
                    href={`/${anime.id}`}
                    className="line-clamp-1 text-sm font-medium text-secondary-foreground hover:text-secondary"
                  >
                    {anime.name}
                  </Link>
                  <Badge episodes={anime.episodes} type={anime.type} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
