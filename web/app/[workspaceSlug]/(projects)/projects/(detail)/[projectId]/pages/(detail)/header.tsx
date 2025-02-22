"use client";

import { useState } from "react";
import { observer } from "mobx-react";
import { useParams, useSearchParams } from "next/navigation";
import { FileText } from "lucide-react";
// types
import { TLogoProps } from "@plane/types";
// ui
import { Breadcrumbs, Button, EmojiIconPicker, EmojiIconPickerTypes, TOAST_TYPE, Tooltip, setToast } from "@plane/ui";
// components
import { BreadcrumbLink, Logo } from "@/components/common";
import { PageEditInformationPopover } from "@/components/pages";
// helpers
import { convertHexEmojiToDecimal } from "@/helpers/emoji.helper";
import { getPageName } from "@/helpers/page.helper";
// hooks
import { usePage, useProject } from "@/hooks/store";
import { usePlatformOS } from "@/hooks/use-platform-os";
// plane web components
import { PageDetailsHeaderExtraActions } from "@/plane-web/components/pages";

export interface IPagesHeaderProps {
  showButton?: boolean;
}

export const PageDetailsHeader = observer(() => {
  // router
  const { workspaceSlug, pageId } = useParams();
  const searchParams = useSearchParams();
  // state
  const [isOpen, setIsOpen] = useState(false);
  // store hooks
  const { currentProjectDetails, loader } = useProject();
  const page = usePage(pageId?.toString() ?? "");
  const { isContentEditable, isSubmitting, name, logo_props, updatePageLogo } = page;
  // use platform
  const { isMobile, platform } = usePlatformOS();
  // derived values
  const isMac = platform === "MacOS";

  const handlePageLogoUpdate = async (data: TLogoProps) => {
    if (data) {
      updatePageLogo(data)
        .then(() => {
          setToast({
            type: TOAST_TYPE.SUCCESS,
            title: "Success!",
            message: "Logo Updated successfully.",
          });
        })
        .catch(() => {
          setToast({
            type: TOAST_TYPE.ERROR,
            title: "Error!",
            message: "Something went wrong. Please try again.",
          });
        });
    }
  };

  const pageTitle = getPageName(name);
  const isVersionHistoryOverlayActive = !!searchParams.get("version");

  return (
    <div className="relative z-10 flex h-[3.75rem] w-full flex-shrink-0 flex-row items-center justify-between gap-x-2 gap-y-4 bg-custom-sidebar-background-100 p-4">
      <div className="flex w-full flex-grow items-center gap-2 overflow-ellipsis whitespace-nowrap">
        <div>
          <Breadcrumbs isLoading={loader}>
            <Breadcrumbs.BreadcrumbItem
              type="text"
              link={
                <span>
                  <span className="hidden md:block">
                    <BreadcrumbLink
                      href={`/${workspaceSlug}/projects/${currentProjectDetails?.id}/issues`}
                      label={currentProjectDetails?.name ?? "Project"}
                      icon={
                        currentProjectDetails && (
                          <span className="grid h-4 w-4 flex-shrink-0 place-items-center">
                            <Logo logo={currentProjectDetails?.logo_props} size={16} />
                          </span>
                        )
                      }
                    />
                  </span>
                  <span className="md:hidden">
                    <BreadcrumbLink
                      href={`/${workspaceSlug}/projects/${currentProjectDetails?.id}/issues`}
                      label={"..."}
                    />
                  </span>
                </span>
              }
            />

            <Breadcrumbs.BreadcrumbItem
              type="text"
              link={
                <BreadcrumbLink
                  href={`/${workspaceSlug}/projects/${currentProjectDetails?.id}/pages`}
                  label="Pages"
                  icon={<FileText className="h-4 w-4 text-custom-text-300" />}
                />
              }
            />
            <Breadcrumbs.BreadcrumbItem
              type="text"
              link={
                <li className="flex items-center space-x-2" tabIndex={-1}>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="flex cursor-default items-center gap-1 text-sm font-medium text-custom-text-100">
                      <div className="flex h-5 w-5 items-center justify-center overflow-hidden">
                        <EmojiIconPicker
                          isOpen={isOpen}
                          handleToggle={(val: boolean) => setIsOpen(val)}
                          className="flex items-center justify-center"
                          buttonClassName="flex items-center justify-center"
                          label={
                            <>
                              {logo_props?.in_use ? (
                                <Logo logo={logo_props} size={16} type="lucide" />
                              ) : (
                                <FileText className="h-4 w-4 text-custom-text-300" />
                              )}
                            </>
                          }
                          onChange={(val) => {
                            let logoValue = {};

                            if (val?.type === "emoji")
                              logoValue = {
                                value: convertHexEmojiToDecimal(val.value.unified),
                                url: val.value.imageUrl,
                              };
                            else if (val?.type === "icon") logoValue = val.value;

                            handlePageLogoUpdate({
                              in_use: val?.type,
                              [val?.type]: logoValue,
                            }).finally(() => setIsOpen(false));
                          }}
                          defaultIconColor={
                            logo_props?.in_use && logo_props.in_use === "icon" ? logo_props?.icon?.color : undefined
                          }
                          defaultOpen={
                            logo_props?.in_use && logo_props?.in_use === "emoji"
                              ? EmojiIconPickerTypes.EMOJI
                              : EmojiIconPickerTypes.ICON
                          }
                        />
                      </div>
                      <Tooltip tooltipContent={pageTitle} position="bottom" isMobile={isMobile}>
                        <div className="relative line-clamp-1 block max-w-[150px] overflow-hidden truncate">
                          {pageTitle}
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                </li>
              }
            />
          </Breadcrumbs>
        </div>
      </div>
      <PageEditInformationPopover page={page} />
      <PageDetailsHeaderExtraActions />
      {isContentEditable && !isVersionHistoryOverlayActive && (
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            // ctrl/cmd + s to save the changes
            const event = new KeyboardEvent("keydown", {
              key: "s",
              ctrlKey: !isMac,
              metaKey: isMac,
            });
            window.dispatchEvent(event);
          }}
          className="flex-shrink-0 w-24"
          loading={isSubmitting === "submitting"}
        >
          {isSubmitting === "submitting" ? "Saving" : "Save changes"}
        </Button>
      )}
    </div>
  );
});
