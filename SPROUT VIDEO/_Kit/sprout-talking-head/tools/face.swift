// Face centres for the reframed speaker (speaker circle, half-screen window), via Apple Vision.
//     swift face.swift frame1.jpg frame2.jpg ...
// Prints one JSON object per input: {"file": ..., "x": cx, "y": cy, "h": height} in 0–1 frame fractions with the
// origin top-left, for the largest face; {"file": ..., "x": null} when no face is found.
import Foundation
import Vision
import ImageIO

for path in CommandLine.arguments.dropFirst() {
    let url = URL(fileURLWithPath: path)
    guard let src = CGImageSourceCreateWithURL(url as CFURL, nil),
          let image = CGImageSourceCreateImageAtIndex(src, 0, nil) else {
        print("{\"file\": \"\(path)\", \"x\": null}")
        continue
    }
    let request = VNDetectFaceRectanglesRequest()
    try? VNImageRequestHandler(cgImage: image, options: [:]).perform([request])
    let faces = (request.results ?? []).sorted { $0.boundingBox.width * $0.boundingBox.height > $1.boundingBox.width * $1.boundingBox.height }
    if let f = faces.first {
        let b = f.boundingBox
        let x = b.midX, y = 1 - b.midY
        print(String(format: "{\"file\": \"%@\", \"x\": %.4f, \"y\": %.4f, \"h\": %.4f}", path, x, y, b.height))
    } else {
        print("{\"file\": \"\(path)\", \"x\": null}")
    }
}
