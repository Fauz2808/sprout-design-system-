// Cut the people (foreground) out of a photo with Apple Vision, locally. Writes a PNG with alpha.
// swift "08 - Generated Screens/App Store/tools/cutout.swift" <in.(webp|png|jpg)> <out.png>
import Foundation
import Vision
import CoreImage
import AppKit

let args = CommandLine.arguments
guard args.count == 3 else { print("usage: cutout <in> <out.png>"); exit(1) }
let inURL = URL(fileURLWithPath: args[1]), outURL = URL(fileURLWithPath: args[2])
guard let ns = NSImage(contentsOf: inURL), let cg = ns.cgImage(forProposedRect: nil, context: nil, hints: nil) else { print("cannot read"); exit(1) }
let req = VNGenerateForegroundInstanceMaskRequest()
let handler = VNImageRequestHandler(cgImage: cg)
try handler.perform([req])
guard let obs = req.results?.first else { print("no foreground found"); exit(2) }
let buf = try obs.generateMaskedImage(ofInstances: obs.allInstances, from: handler, croppedToInstancesExtent: false)
let ci = CIImage(cvPixelBuffer: buf)
let ctx = CIContext()
try ctx.writePNGRepresentation(of: ci, to: outURL, format: .RGBA8, colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!)
print("ok", obs.allInstances.count, "instances ->", outURL.path)
