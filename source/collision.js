function hitTestRectangle(r1, r2){
    var hit = false;
    var vx = r1.centerX() - r2.centerX();
    var vy = r1.centerY() - r2.centerY();
    var combinedHalfWidths = r1.halfWidth() + r2.halfWidth();
    var combinedHalfHeights = r1.halfHeight() + r2.halfHeight();

    if (Math.abs(vx) < combinedHalfWidths){
        if (Math.abs(vy) < combinedHalfHeights)
            hit = true;
        else
            hit = false;
    }
    else
        hit = false;

    return hit;
}
