"use strict";

var _esprima = require("esprima");

var code = "\nconst initialState = { num: 0 };\n\nfunction reducer(prevState = initialState, action = { type: \"\", data: \"{}\" }) {\n  console.log({ action });\n  console.log(\"contract\", { state });\n  const data = action.data;\n  switch (action.type) {\n    case \"increment\":\n      prevState.num++;\n      state = prevState;\n      break;\n    case \"add\":\n      prevState.num += parseInt(data.num, 10);\n      state = prevState;\n      break;\n    default:\n      state = prevState;\n  }\n  console.log(\"contract\", { state });\n}\n\nlet state = initialState;\n";
var template = "\nconst initialState = @state;\n\nfunction reducer(prevState = initialState, action = { type: \"\", data: \"{}\" }) {\n  const data = action.data;\n  switch (action.type) {\n    @reducer\n    default:\n      state = prevState;\n  }\n  state = prevState;  \n}\n\nlet state = initialState;\n";
var word = ["reducer", "initialState", "prev", "action", "type", "data", "state"];
var whitelist = ["console", "log", "JSON", "parse", "parseInt", "isOwner", "pubkey"];
code = translate({
  num: 0
}, {
  increment: "prevState.num++;",
  decrement: "prevState.num--;"
});
var token = (0, _esprima.tokenize)(code);
var illigals = token.map(function (item) {
  if (item.type === "Identifier" && !word.includes(item.value) && !whitelist.includes(item.value)) return item.value;
}).filter(function (v) {
  return v;
});
console.log({
  illigals: illigals
});
illigals.forEach(function (word, i) {
  if (word) {
    code = code.replace(new RegExp(word, "g"), "Identifier" + i);
  }
});
console.log(code);

function translate(state, reducers) {
  var code = template;
  code = code.replace(new RegExp("@state", "g"), JSON.stringify(state));
  var reducer = "";
  Object.keys(reducers).forEach(function (key) {
    var func = reducers[key];
    reducer += "\n    case \"".concat(key, "\":\n    {\n        ").concat(func, "\n    }\n    break;\n    ");
  });
  code = code.replace(new RegExp("@reducer", "g"), reducer);
  return code;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wbGF5Z3JvdW5kL2VzcHJpbWEudHMiXSwibmFtZXMiOlsiY29kZSIsInRlbXBsYXRlIiwid29yZCIsIndoaXRlbGlzdCIsInRyYW5zbGF0ZSIsIm51bSIsImluY3JlbWVudCIsImRlY3JlbWVudCIsInRva2VuIiwiaWxsaWdhbHMiLCJtYXAiLCJpdGVtIiwidHlwZSIsImluY2x1ZGVzIiwidmFsdWUiLCJmaWx0ZXIiLCJ2IiwiY29uc29sZSIsImxvZyIsImZvckVhY2giLCJpIiwicmVwbGFjZSIsIlJlZ0V4cCIsInN0YXRlIiwicmVkdWNlcnMiLCJKU09OIiwic3RyaW5naWZ5IiwicmVkdWNlciIsIk9iamVjdCIsImtleXMiLCJrZXkiLCJmdW5jIl0sIm1hcHBpbmdzIjoiOztBQUFBOztBQUVBLElBQUlBLElBQUksc2pCQUFSO0FBeUJBLElBQU1DLFFBQVEsc1NBQWQ7QUFnQkEsSUFBTUMsSUFBSSxHQUFHLENBQ1gsU0FEVyxFQUVYLGNBRlcsRUFHWCxNQUhXLEVBSVgsUUFKVyxFQUtYLE1BTFcsRUFNWCxNQU5XLEVBT1gsT0FQVyxDQUFiO0FBU0EsSUFBTUMsU0FBUyxHQUFHLENBQ2hCLFNBRGdCLEVBRWhCLEtBRmdCLEVBR2hCLE1BSGdCLEVBSWhCLE9BSmdCLEVBS2hCLFVBTGdCLEVBTWhCLFNBTmdCLEVBT2hCLFFBUGdCLENBQWxCO0FBVUFILElBQUksR0FBR0ksU0FBUyxDQUNkO0FBQUVDLEVBQUFBLEdBQUcsRUFBRTtBQUFQLENBRGMsRUFFZDtBQUNFQyxFQUFBQSxTQUFTLEVBQUUsa0JBRGI7QUFFRUMsRUFBQUEsU0FBUyxFQUFFO0FBRmIsQ0FGYyxDQUFoQjtBQVFBLElBQU1DLEtBQUssR0FBRyx1QkFBU1IsSUFBVCxDQUFkO0FBQ0EsSUFBTVMsUUFBUSxHQUFHRCxLQUFLLENBQ25CRSxHQURjLENBQ1YsVUFBQUMsSUFBSSxFQUFJO0FBQ1gsTUFDRUEsSUFBSSxDQUFDQyxJQUFMLEtBQWMsWUFBZCxJQUNBLENBQUNWLElBQUksQ0FBQ1csUUFBTCxDQUFjRixJQUFJLENBQUNHLEtBQW5CLENBREQsSUFFQSxDQUFDWCxTQUFTLENBQUNVLFFBQVYsQ0FBbUJGLElBQUksQ0FBQ0csS0FBeEIsQ0FISCxFQUtFLE9BQU9ILElBQUksQ0FBQ0csS0FBWjtBQUNILENBUmMsRUFTZEMsTUFUYyxDQVNQLFVBQUFDLENBQUM7QUFBQSxTQUFJQSxDQUFKO0FBQUEsQ0FUTSxDQUFqQjtBQVdBQyxPQUFPLENBQUNDLEdBQVIsQ0FBWTtBQUFFVCxFQUFBQSxRQUFRLEVBQVJBO0FBQUYsQ0FBWjtBQUVBQSxRQUFRLENBQUNVLE9BQVQsQ0FBaUIsVUFBQ2pCLElBQUQsRUFBT2tCLENBQVAsRUFBYTtBQUM1QixNQUFJbEIsSUFBSixFQUFVO0FBQ1JGLElBQUFBLElBQUksR0FBR0EsSUFBSSxDQUFDcUIsT0FBTCxDQUFhLElBQUlDLE1BQUosQ0FBV3BCLElBQVgsRUFBaUIsR0FBakIsQ0FBYixFQUFvQyxlQUFla0IsQ0FBbkQsQ0FBUDtBQUNEO0FBQ0YsQ0FKRDtBQU1BSCxPQUFPLENBQUNDLEdBQVIsQ0FBWWxCLElBQVo7O0FBRUEsU0FBU0ksU0FBVCxDQUFtQm1CLEtBQW5CLEVBQThCQyxRQUE5QixFQUFtRTtBQUNqRSxNQUFJeEIsSUFBSSxHQUFHQyxRQUFYO0FBQ0FELEVBQUFBLElBQUksR0FBR0EsSUFBSSxDQUFDcUIsT0FBTCxDQUFhLElBQUlDLE1BQUosQ0FBVyxRQUFYLEVBQXFCLEdBQXJCLENBQWIsRUFBd0NHLElBQUksQ0FBQ0MsU0FBTCxDQUFlSCxLQUFmLENBQXhDLENBQVA7QUFDQSxNQUFJSSxPQUFPLEdBQUcsRUFBZDtBQUVBQyxFQUFBQSxNQUFNLENBQUNDLElBQVAsQ0FBWUwsUUFBWixFQUFzQkwsT0FBdEIsQ0FBOEIsVUFBQVcsR0FBRyxFQUFJO0FBQ25DLFFBQU1DLElBQUksR0FBR1AsUUFBUSxDQUFDTSxHQUFELENBQXJCO0FBQ0FILElBQUFBLE9BQU8sMkJBQ0NHLEdBREQsaUNBR0RDLElBSEMsOEJBQVA7QUFPRCxHQVREO0FBV0EvQixFQUFBQSxJQUFJLEdBQUdBLElBQUksQ0FBQ3FCLE9BQUwsQ0FBYSxJQUFJQyxNQUFKLENBQVcsVUFBWCxFQUF1QixHQUF2QixDQUFiLEVBQTBDSyxPQUExQyxDQUFQO0FBQ0EsU0FBTzNCLElBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHRva2VuaXplIH0gZnJvbSBcImVzcHJpbWFcIjtcblxubGV0IGNvZGUgPSBgXG5jb25zdCBpbml0aWFsU3RhdGUgPSB7IG51bTogMCB9O1xuXG5mdW5jdGlvbiByZWR1Y2VyKHByZXZTdGF0ZSA9IGluaXRpYWxTdGF0ZSwgYWN0aW9uID0geyB0eXBlOiBcIlwiLCBkYXRhOiBcInt9XCIgfSkge1xuICBjb25zb2xlLmxvZyh7IGFjdGlvbiB9KTtcbiAgY29uc29sZS5sb2coXCJjb250cmFjdFwiLCB7IHN0YXRlIH0pO1xuICBjb25zdCBkYXRhID0gYWN0aW9uLmRhdGE7XG4gIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICBjYXNlIFwiaW5jcmVtZW50XCI6XG4gICAgICBwcmV2U3RhdGUubnVtKys7XG4gICAgICBzdGF0ZSA9IHByZXZTdGF0ZTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJhZGRcIjpcbiAgICAgIHByZXZTdGF0ZS5udW0gKz0gcGFyc2VJbnQoZGF0YS5udW0sIDEwKTtcbiAgICAgIHN0YXRlID0gcHJldlN0YXRlO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHN0YXRlID0gcHJldlN0YXRlO1xuICB9XG4gIGNvbnNvbGUubG9nKFwiY29udHJhY3RcIiwgeyBzdGF0ZSB9KTtcbn1cblxubGV0IHN0YXRlID0gaW5pdGlhbFN0YXRlO1xuYDtcblxuY29uc3QgdGVtcGxhdGUgPSBgXG5jb25zdCBpbml0aWFsU3RhdGUgPSBAc3RhdGU7XG5cbmZ1bmN0aW9uIHJlZHVjZXIocHJldlN0YXRlID0gaW5pdGlhbFN0YXRlLCBhY3Rpb24gPSB7IHR5cGU6IFwiXCIsIGRhdGE6IFwie31cIiB9KSB7XG4gIGNvbnN0IGRhdGEgPSBhY3Rpb24uZGF0YTtcbiAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgIEByZWR1Y2VyXG4gICAgZGVmYXVsdDpcbiAgICAgIHN0YXRlID0gcHJldlN0YXRlO1xuICB9XG4gIHN0YXRlID0gcHJldlN0YXRlOyAgXG59XG5cbmxldCBzdGF0ZSA9IGluaXRpYWxTdGF0ZTtcbmA7XG5cbmNvbnN0IHdvcmQgPSBbXG4gIFwicmVkdWNlclwiLFxuICBcImluaXRpYWxTdGF0ZVwiLFxuICBcInByZXZcIixcbiAgXCJhY3Rpb25cIixcbiAgXCJ0eXBlXCIsXG4gIFwiZGF0YVwiLFxuICBcInN0YXRlXCJcbl07XG5jb25zdCB3aGl0ZWxpc3QgPSBbXG4gIFwiY29uc29sZVwiLFxuICBcImxvZ1wiLFxuICBcIkpTT05cIixcbiAgXCJwYXJzZVwiLFxuICBcInBhcnNlSW50XCIsXG4gIFwiaXNPd25lclwiLFxuICBcInB1YmtleVwiXG5dO1xuXG5jb2RlID0gdHJhbnNsYXRlKFxuICB7IG51bTogMCB9LFxuICB7XG4gICAgaW5jcmVtZW50OiBcInByZXZTdGF0ZS5udW0rKztcIixcbiAgICBkZWNyZW1lbnQ6IFwicHJldlN0YXRlLm51bS0tO1wiXG4gIH1cbik7XG5cbmNvbnN0IHRva2VuID0gdG9rZW5pemUoY29kZSk7XG5jb25zdCBpbGxpZ2FscyA9IHRva2VuXG4gIC5tYXAoaXRlbSA9PiB7XG4gICAgaWYgKFxuICAgICAgaXRlbS50eXBlID09PSBcIklkZW50aWZpZXJcIiAmJlxuICAgICAgIXdvcmQuaW5jbHVkZXMoaXRlbS52YWx1ZSkgJiZcbiAgICAgICF3aGl0ZWxpc3QuaW5jbHVkZXMoaXRlbS52YWx1ZSlcbiAgICApXG4gICAgICByZXR1cm4gaXRlbS52YWx1ZTtcbiAgfSlcbiAgLmZpbHRlcih2ID0+IHYpO1xuXG5jb25zb2xlLmxvZyh7IGlsbGlnYWxzIH0pO1xuXG5pbGxpZ2Fscy5mb3JFYWNoKCh3b3JkLCBpKSA9PiB7XG4gIGlmICh3b3JkKSB7XG4gICAgY29kZSA9IGNvZGUucmVwbGFjZShuZXcgUmVnRXhwKHdvcmQsIFwiZ1wiKSwgXCJJZGVudGlmaWVyXCIgKyBpKTtcbiAgfVxufSk7XG5cbmNvbnNvbGUubG9nKGNvZGUpO1xuXG5mdW5jdGlvbiB0cmFuc2xhdGUoc3RhdGU6IHt9LCByZWR1Y2VyczogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSkge1xuICBsZXQgY29kZSA9IHRlbXBsYXRlO1xuICBjb2RlID0gY29kZS5yZXBsYWNlKG5ldyBSZWdFeHAoXCJAc3RhdGVcIiwgXCJnXCIpLCBKU09OLnN0cmluZ2lmeShzdGF0ZSkpO1xuICBsZXQgcmVkdWNlciA9IFwiXCI7XG5cbiAgT2JqZWN0LmtleXMocmVkdWNlcnMpLmZvckVhY2goa2V5ID0+IHtcbiAgICBjb25zdCBmdW5jID0gcmVkdWNlcnNba2V5XTtcbiAgICByZWR1Y2VyICs9IGBcbiAgICBjYXNlIFwiJHtrZXl9XCI6XG4gICAge1xuICAgICAgICAke2Z1bmN9XG4gICAgfVxuICAgIGJyZWFrO1xuICAgIGA7XG4gIH0pO1xuXG4gIGNvZGUgPSBjb2RlLnJlcGxhY2UobmV3IFJlZ0V4cChcIkByZWR1Y2VyXCIsIFwiZ1wiKSwgcmVkdWNlcik7XG4gIHJldHVybiBjb2RlO1xufVxuIl19