const getLabel = url => ["", ...url.pathname.split("/").slice(2)].join("/");

export default getLabel;
