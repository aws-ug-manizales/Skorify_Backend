export const generalMethodMapper = [
  { method: "delete", patterns: [/^Delete/] },
  {
    method: "patch",
    patterns: [/^Edit/, /^Update/, /^Asign/, /^Modify/, /^Set/],
  },
  { method: "get", patterns: [/^Get/, /^Consult/, /^Enroll/,/^Filter/] },
  { method: "put", patterns: [/^Add/, /^Create/, /^Save/, /^Register/] },
  { method: "post", patterns: [/.+/] },
];
