export default function getCourseName(item) {
  return item.name ? `${item.name} (${item.index}º)` : `${item.index}º`;
}
